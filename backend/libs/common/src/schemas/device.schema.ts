import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeviceDocument = Device & Document;

export enum DeviceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DISCONNECTED = 'disconnected',
}

export enum DeviceModel {
  MODEL_X = 'model_x',
  MODEL_Y = 'model_y',
  MODEL_Z = 'model_z',
}

export interface DeviceSettings {
  autoConnect: boolean;
  notificationEnabled: boolean;
  vibrationIntensity: number;
  ledBrightness: number;
  sleepMode: boolean;
  customName?: string;
  channelAEnabled: boolean;
  channelBEnabled: boolean;
}

export interface DeviceMetrics {
  totalUsageTime: number;
  totalSessions: number;
  averageSessionDuration: number;
  lastActiveAt: Date;
  dailyUsage: Array<{
    date: Date;
    duration: number;
    sessions: number;
  }>;
}

export interface FirmwareInfo {
  version: string;
  releaseDate: Date;
  updateAvailable: boolean;
  latestVersion?: string;
  updateUrl?: string;
}

@Schema({ timestamps: true, collection: 'devices' })
export class Device {
  @Prop({ required: true, unique: true })
  deviceId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, uppercase: true })
  macAddress: string;

  @Prop({ type: String, enum: DeviceModel, required: true })
  model: DeviceModel;

  @Prop({ required: true })
  serialNumber: string;

  @Prop({ type: String, enum: DeviceStatus, default: DeviceStatus.DISCONNECTED })
  status: DeviceStatus;

  @Prop({ type: Object, required: true })
  firmware: FirmwareInfo;

  @Prop({ type: Object, default: {} })
  settings: DeviceSettings;

  @Prop({ default: 0, min: 0, max: 100 })
  batteryLevel: number;

  @Prop({ default: false })
  isCharging: boolean;

  @Prop({ default: 0 })
  rssi: number;

  @Prop()
  lastConnectedAt?: Date;

  @Prop()
  lastDisconnectedAt?: Date;

  @Prop()
  pairingCode?: string;

  @Prop()
  pairingCodeExpiresAt?: Date;

  @Prop({ default: false })
  isPaired: boolean;

  @Prop()
  pairedAt?: Date;

  @Prop({ type: Object, default: {} })
  metrics: DeviceMetrics;

  @Prop({ type: [String], default: [] })
  connectionHistory: Array<{
    connectedAt: Date;
    disconnectedAt?: Date;
    duration?: number;
    ipAddress?: string;
  }>;

  @Prop({ type: Object })
  calibration?: {
    channelA: {
      offset: number;
      gain: number;
    };
    channelB: {
      offset: number;
      gain: number;
    };
    calibratedAt: Date;
  };

  @Prop({ type: [Object], default: [] })
  commands: Array<{
    command: string;
    params: any;
    sentAt: Date;
    acknowledgedAt?: Date;
    response?: any;
    status: 'pending' | 'sent' | 'acknowledged' | 'failed';
  }>;

  @Prop({ type: Object })
  diagnostics?: {
    temperature: number;
    voltage: number;
    current: number;
    errorCount: number;
    lastError?: string;
    lastErrorAt?: Date;
    healthScore: number;
  };

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  deletedAt?: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);