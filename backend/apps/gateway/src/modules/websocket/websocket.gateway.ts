import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { DeviceCommandDto } from './dto/device-command.dto';
import { AudioStreamDto } from './dto/audio-stream.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  deviceId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/ws',
  transports: ['websocket', 'polling'],
})
@UsePipes(new ValidationPipe())
export class WebSocketGatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGatewayService.name);
  private readonly connectedClients = new Map<string, AuthenticatedSocket>();
  private readonly userSockets = new Map<string, Set<string>>();
  private readonly deviceSockets = new Map<string, string>();

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract and verify JWT token from query or auth header
      const token = this.extractToken(client);
      
      if (!token) {
        throw new WsException('Missing authentication token');
      }

      const payload = await this.verifyToken(token);
      
      // Store user info in socket
      client.userId = payload.sub;
      client.deviceId = client.handshake.query.deviceId as string;

      // Add to connected clients
      this.connectedClients.set(client.id, client);

      // Track user sockets
      if (!this.userSockets.has(client.userId)) {
        this.userSockets.set(client.userId, new Set());
      }
      this.userSockets.get(client.userId)?.add(client.id);

      // Track device socket if provided
      if (client.deviceId) {
        this.deviceSockets.set(client.deviceId, client.id);
      }

      // Join user room
      client.join(`user:${client.userId}`);
      
      // Join device room if device ID provided
      if (client.deviceId) {
        client.join(`device:${client.deviceId}`);
      }

      this.logger.log(`Client connected: ${client.id} (User: ${client.userId})`);

      // Send connection success event
      client.emit('connected', {
        socketId: client.id,
        userId: client.userId,
        deviceId: client.deviceId,
      });

    } catch (error) {
      this.logger.error(`Connection refused: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    // Remove from connected clients
    this.connectedClients.delete(client.id);

    // Remove from user sockets
    if (client.userId) {
      const userSocketSet = this.userSockets.get(client.userId);
      userSocketSet?.delete(client.id);
      
      if (userSocketSet?.size === 0) {
        this.userSockets.delete(client.userId);
      }
    }

    // Remove from device sockets
    if (client.deviceId) {
      this.deviceSockets.delete(client.deviceId);
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('device:command')
  @UseGuards(WsJwtGuard)
  async handleDeviceCommand(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: DeviceCommandDto,
  ) {
    try {
      const { deviceId, command, params } = data;

      // Check if user owns the device
      // TODO: Implement device ownership check

      // Send command to device
      this.server.to(`device:${deviceId}`).emit('device:command', {
        command,
        params,
        timestamp: new Date().toISOString(),
      });

      // Send acknowledgment to client
      client.emit('device:command:ack', {
        deviceId,
        command,
        status: 'sent',
      });

      this.logger.log(`Device command sent: ${command} to ${deviceId}`);
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('device:status')
  @UseGuards(WsJwtGuard)
  async handleDeviceStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    const { deviceId, status } = data;

    // Broadcast status to all clients watching this device
    this.server.to(`device:${deviceId}`).emit('device:status:update', {
      deviceId,
      status,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Device status update: ${deviceId}`);
  }

  @SubscribeMessage('audio:stream:start')
  @UseGuards(WsJwtGuard)
  async handleAudioStreamStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: AudioStreamDto,
  ) {
    const { deviceId, sampleRate, channels } = data;

    // Join audio stream room
    client.join(`audio:${deviceId}`);

    // Initialize audio stream
    client.emit('audio:stream:ready', {
      deviceId,
      streamId: `stream_${Date.now()}`,
      config: { sampleRate, channels },
    });

    this.logger.log(`Audio stream started for device: ${deviceId}`);
  }

  @SubscribeMessage('audio:stream:data')
  @UseGuards(WsJwtGuard)
  async handleAudioStreamData(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { deviceId: string; buffer: ArrayBuffer },
  ) {
    const { deviceId, buffer } = data;

    // Process audio data and generate device commands
    // TODO: Implement audio processing logic

    // Send processed commands to device
    this.server.to(`device:${deviceId}`).emit('device:vibration', {
      intensity: Math.random() * 100, // Mock intensity based on audio
      pattern: 'wave',
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('audio:stream:stop')
  @UseGuards(WsJwtGuard)
  async handleAudioStreamStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { deviceId: string },
  ) {
    const { deviceId } = data;

    // Leave audio stream room
    client.leave(`audio:${deviceId}`);

    // Stop device vibration
    this.server.to(`device:${deviceId}`).emit('device:command', {
      command: 'stop',
      params: {},
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Audio stream stopped for device: ${deviceId}`);
  }

  @SubscribeMessage('sync:story:progress')
  @UseGuards(WsJwtGuard)
  async handleStoryProgress(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { storyId: string; progress: number; sceneId?: string },
  ) {
    const { storyId, progress, sceneId } = data;

    // Broadcast progress to all user's devices
    this.server.to(`user:${client.userId}`).emit('sync:story:progress:update', {
      storyId,
      progress,
      sceneId,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Story progress synced: ${storyId} - ${progress}%`);
  }

  @SubscribeMessage('presence:update')
  @UseGuards(WsJwtGuard)
  async handlePresenceUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { status: 'online' | 'away' | 'busy' },
  ) {
    const { status } = data;

    // Update user presence
    this.server.emit('presence:changed', {
      userId: client.userId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  // Utility methods

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    const queryToken = client.handshake.query.token as string;

    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    return queryToken || null;
  }

  private async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }

  // Public methods for other services to emit events

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToDevice(deviceId: string, event: string, data: any) {
    this.server.to(`device:${deviceId}`).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  isDeviceOnline(deviceId: string): boolean {
    return this.deviceSockets.has(deviceId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getOnlineDevices(): string[] {
    return Array.from(this.deviceSockets.keys());
  }
}