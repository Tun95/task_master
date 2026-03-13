import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '../../sessions/session.service';
import { PrismaService } from '../../prisma/prisma.service';
import { getFirebaseAuth } from '@/config/firebase.config';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private sessionService: SessionService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    try {
      // Check if token is a sessionId or actual token
      const session = await this.prisma.session.findFirst({
        where: {
          OR: [{ id: token }, { token: token }],
          isActive: true,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        throw new UnauthorizedException('Session expired or invalid');
      }

      // Get Firebase Auth instance
      const firebaseAuth = getFirebaseAuth();

      try {
        // Verify Firebase token and check if it's revoked
        const decodedToken = await firebaseAuth.verifyIdToken(
          session.token,
          true,
        ); // true = checkRevoked

        // Get user from database
        const user = await this.prisma.user.findUnique({
          where: { firebaseUid: decodedToken.uid },
        });

        const admin = await this.prisma.admin.findUnique({
          where: { firebaseUid: decodedToken.uid },
        });

        if (!user && !admin) {
          throw new UnauthorizedException('User not found');
        }

        // Check if password was changed after this token was issued
        const account = user || admin;
        const tokenIssuedAt = new Date(decodedToken.iat * 1000);
        const passwordChangedAt = account?.updatedAt;

        if (passwordChangedAt && passwordChangedAt > tokenIssuedAt) {
          // Token was issued before password was changed, so it's invalid
          await this.sessionService.invalidateSession(session.token);
          throw new UnauthorizedException(
            'Password has been changed. Please login again.',
          );
        }

        // Update last activity
        await this.prisma.session.update({
          where: { id: session.id },
          data: { lastActivity: new Date() },
        });

        // Attach user/admin to request
        request.user = account;
        request.userType = user ? 'user' : 'admin';
        request.firebaseUid = decodedToken.uid;
        request.token = token;
        request.session = session;

        return true;
      } catch (firebaseError) {
        // If Firebase verification fails, check if it's because tokens were revoked
        if (firebaseError.code === 'auth/id-token-revoked') {
          await this.sessionService.invalidateSession(session.token);
          throw new UnauthorizedException(
            'Session has been revoked. Please login again.',
          );
        }

        // Fallback to session-only validation
        if (session) {
          const user = await this.prisma.user.findUnique({
            where: { firebaseUid: session.firebaseUid },
          });

          const admin = await this.prisma.admin.findUnique({
            where: { firebaseUid: session.firebaseUid },
          });

          if (!user && !admin) {
            throw new UnauthorizedException('User not found');
          }

          request.user = user || admin;
          request.userType = user ? 'user' : 'admin';
          request.firebaseUid = session.firebaseUid;
          request.token = token;
          request.session = session;

          return true;
        }
        throw new UnauthorizedException('Invalid token');
      }
    } catch {
      throw new UnauthorizedException('Invalid token or session');
    }
  }

  private extractToken(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
