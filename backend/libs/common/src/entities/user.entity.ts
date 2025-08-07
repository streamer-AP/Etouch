import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Exclude, Transform } from 'class-transformer';

export enum UserRole {
  USER = 'user',
  PREMIUM = 'premium',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple',
  WECHAT = 'wechat',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['phone'], { unique: true, where: 'phone IS NOT NULL' })
@Index(['status'])
@Index(['createdAt'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column({ length: 100, nullable: true })
  firstName?: string;

  @Column({ length: 100, nullable: true })
  lastName?: string;

  @Column({ length: 500, nullable: true })
  avatarUrl?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider: AuthProvider;

  @Column({ nullable: true })
  providerId?: string;

  @Column({ type: 'datetime', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  phoneVerifiedAt?: Date;

  @Column({ type: 'json', nullable: true })
  preferences?: {
    language: string;
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisible: boolean;
      activityVisible: boolean;
    };
  };

  @Column({ type: 'json', nullable: true })
  metadata?: {
    lastLoginAt?: Date;
    lastLoginIp?: string;
    loginCount?: number;
    deviceTokens?: string[];
    referralCode?: string;
    referredBy?: string;
  };

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ type: 'datetime', nullable: true })
  lockedUntil?: Date;

  @Column({ length: 500, nullable: true })
  @Exclude()
  refreshToken?: string;

  @Column({ length: 6, nullable: true })
  @Exclude()
  verificationCode?: string;

  @Column({ type: 'datetime', nullable: true })
  @Exclude()
  verificationCodeExpiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt?: Date;

  // Methods
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }

  isLocked(): boolean {
    return !!(this.lockedUntil && this.lockedUntil > new Date());
  }

  incrementLoginAttempts(): void {
    this.loginAttempts = (this.loginAttempts || 0) + 1;
    
    if (this.loginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
    }
  }

  resetLoginAttempts(): void {
    this.loginAttempts = 0;
    this.lockedUntil = null;
  }

  toJSON() {
    const { password, refreshToken, verificationCode, ...user } = this;
    return user;
  }
}