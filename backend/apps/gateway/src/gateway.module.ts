import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';
import { ContentModule } from './modules/content/content.module';
import { AudioModule } from './modules/audio/audio.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { HealthModule } from './modules/health/health.module';
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '.env.local'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),

    // Microservices clients
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('microservices.auth.host'),
            port: configService.get('microservices.auth.port'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('microservices.user.host'),
            port: configService.get('microservices.user.port'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'DEVICE_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('microservices.device.host'),
            port: configService.get('microservices.device.port'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'CONTENT_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('microservices.content.host'),
            port: configService.get('microservices.content.port'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'AUDIO_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('rabbitmq.url')],
            queue: 'audio_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),

    // Feature modules
    AuthModule,
    UsersModule,
    DevicesModule,
    ContentModule,
    AudioModule,
    WebSocketModule,
    HealthModule,
  ],
})
export class GatewayModule {}