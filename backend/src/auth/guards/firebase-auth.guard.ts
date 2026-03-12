import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '../../sessions/session.service';
import { PrismaService } from '../../prisma/prisma.service';
import { getFirebaseAuth } from 'config/firebase.config';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private sessionService: SessionService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // First check if session exists and is valid
      const isValidSession = await this.sessionService.validateSession(token);
      if (!isValidSession) {
        throw new UnauthorizedException('Session expired or invalid');
      }

      // Get Firebase Auth instance
      const firebaseAuth = getFirebaseAuth();

      // Verify Firebase token
      const decodedToken = await firebaseAuth.verifyIdToken(token);

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

      // Attach user/admin to request
      request.user = user || admin;
      request.userType = user ? 'user' : 'admin';
      request.firebaseUid = decodedToken.uid;
      request.token = token;

      return true;
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
