import { Injectable } from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service';
import { PrismaService } from '@/utils/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  // Generate a unique session token
  private generateSessionToken(): string {
    return `sess_${crypto.randomBytes(32).toString('hex')}`;
  }

  async createSession(data: {
    firebaseUid: string;
    email: string;
    ipAddress?: string;
    userAgent?: string;
    location?: any;
    userId?: string;
    adminId?: string;
    expiresIn?: number; // seconds
  }) {
    // First, invalidate any existing active sessions for this user
    await this.invalidateAllUserSessions(data.firebaseUid);

    // Calculate expiration (default 7 days)
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (data.expiresIn || 604800));

    // Generate a unique token
    const sessionToken = this.generateSessionToken();

    // Create new session
    const session = await this.prisma.session.create({
      data: {
        firebaseUid: data.firebaseUid,
        email: data.email,
        token: sessionToken,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        location: data.location || {},
        expiresAt,
        isActive: true,
        userId: data.userId,
        adminId: data.adminId,
      },
    });

    this.logger.activity('SESSION_CREATED', data.userId || data.adminId, {
      firebaseUid: data.firebaseUid,
      sessionId: session.id,
    });

    return session;
  }

  async validateSession(token: string): Promise<boolean> {
    const session = await this.prisma.session.findFirst({
      where: {
        token,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) return false;

    // Update last activity
    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastActivity: new Date() },
    });

    return true;
  }

  async invalidateSession(token: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { token },
      data: { isActive: false },
    });

    this.logger.activity('SESSION_INVALIDATED', undefined, { token });
  }

  async invalidateAllUserSessions(firebaseUid: string): Promise<void> {
    const sessions = await this.prisma.session.findMany({
      where: {
        firebaseUid,
        isActive: true,
      },
    });

    if (sessions.length > 0) {
      await this.prisma.session.updateMany({
        where: {
          firebaseUid,
          isActive: true,
        },
        data: { isActive: false },
      });

      this.logger.activity('ALL_SESSIONS_INVALIDATED', undefined, {
        firebaseUid,
        count: sessions.length,
      });
    }
  }

  async getActiveSession(token: string) {
    return this.prisma.session.findFirst({
      where: {
        token,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
        admin: true,
      },
    });
  }

  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true,
      },
      data: { isActive: false },
    });

    if (result.count > 0) {
      this.logger.log(
        `Cleaned up ${result.count} expired sessions`,
        'SessionService',
      );
    }

    return result.count;
  }
}
