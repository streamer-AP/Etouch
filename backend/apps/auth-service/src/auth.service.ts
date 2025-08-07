import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus, AuthProvider } from '@app/common/entities/user.entity';
import { Session } from './entities/session.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenPayload } from './interfaces/token-payload.interface';
import { AuthResponse } from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, username, password, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new BadRequestException('User already exists with this email or username');
    }

    // Create new user
    const user = this.userRepository.create({
      email,
      username,
      password,
      phone,
      provider: AuthProvider.LOCAL,
      verificationCode: this.generateVerificationCode(),
      verificationCodeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await this.userRepository.save(user);

    // Send verification email (implement email service)
    await this.sendVerificationEmail(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create session
    await this.createSession(user, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password, deviceId } = loginDto;

    // Find user with password
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'username', 'password', 'status', 'loginAttempts', 'lockedUntil'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new UnauthorizedException('Account is locked. Please try again later');
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      user.incrementLoginAttempts();
      await this.userRepository.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts
    user.resetLoginAttempts();
    user.metadata = {
      ...user.metadata,
      lastLoginAt: new Date(),
      loginCount: (user.metadata?.loginCount || 0) + 1,
    };
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create or update session
    await this.createSession(user, tokens.refreshToken, deviceId);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    const { refreshToken } = refreshTokenDto;

    // Verify refresh token
    let payload: TokenPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find session
    const session = await this.sessionRepository.findOne({
      where: {
        userId: payload.sub,
        refreshToken,
        isValid: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      session.isValid = false;
      await this.sessionRepository.save(session);
      throw new UnauthorizedException('Session expired');
    }

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user);

    // Update session
    session.refreshToken = tokens.refreshToken;
    session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    session.lastActivityAt = new Date();
    await this.sessionRepository.save(session);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Invalidate specific session
      await this.sessionRepository.update(
        { userId, refreshToken },
        { isValid: false },
      );
    } else {
      // Invalidate all sessions for user
      await this.sessionRepository.update(
        { userId },
        { isValid: false },
      );
    }

    // Clear cache
    await this.cacheManager.del(`user:${userId}`);
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<boolean> {
    const { email, code } = verifyEmailDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email already verified');
    }

    if (user.verificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    if (user.verificationCodeExpiresAt < new Date()) {
      throw new BadRequestException('Verification code expired');
    }

    user.emailVerifiedAt = new Date();
    user.verificationCode = null;
    user.verificationCodeExpiresAt = null;
    await this.userRepository.save(user);

    return true;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const resetToken = this.generateResetToken();
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in cache
    await this.cacheManager.set(
      `reset:${resetToken}`,
      { userId: user.id, email: user.email },
      3600, // 1 hour
    );

    // Send reset email (implement email service)
    await this.sendPasswordResetEmail(user, resetToken);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    const { token, newPassword } = resetPasswordDto;

    // Get user info from cache
    const resetData = await this.cacheManager.get<{ userId: string; email: string }>(
      `reset:${token}`,
    );

    if (!resetData) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    const user = await this.userRepository.findOne({
      where: { id: resetData.userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.password = newPassword;
    await this.userRepository.save(user);

    // Delete reset token from cache
    await this.cacheManager.del(`reset:${token}`);

    // Invalidate all sessions
    await this.sessionRepository.update(
      { userId: user.id },
      { isValid: false },
    );

    return true;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'username', 'password', 'status'],
    });

    if (!user || !(await user.comparePassword(password))) {
      return null;
    }

    return user;
  }

  async validateToken(userId: string): Promise<User> {
    // Check cache first
    const cachedUser = await this.cacheManager.get<User>(`user:${userId}`);
    
    if (cachedUser) {
      return cachedUser;
    }

    // Get from database
    const user = await this.userRepository.findOne({
      where: { id: userId, status: UserStatus.ACTIVE },
    });

    if (user) {
      // Cache user data
      await this.cacheManager.set(`user:${userId}`, user, 3600); // 1 hour
    }

    return user;
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async createSession(user: User, refreshToken: string, deviceId?: string): Promise<Session> {
    // Invalidate existing sessions for the same device
    if (deviceId) {
      await this.sessionRepository.update(
        { userId: user.id, deviceId },
        { isValid: false },
      );
    }

    const session = this.sessionRepository.create({
      userId: user.id,
      refreshToken,
      deviceId: deviceId || uuidv4(),
      userAgent: '', // Get from request headers
      ipAddress: '', // Get from request
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return await this.sessionRepository.save(session);
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password, refreshToken, verificationCode, ...sanitized } = user;
    return sanitized;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateResetToken(): string {
    return uuidv4().replace(/-/g, '');
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    // Implement email service
    console.log(`Sending verification email to ${user.email} with code ${user.verificationCode}`);
  }

  private async sendPasswordResetEmail(user: User, token: string): Promise<void> {
    // Implement email service
    console.log(`Sending password reset email to ${user.email} with token ${token}`);
  }
}