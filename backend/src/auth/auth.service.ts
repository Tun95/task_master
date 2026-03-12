import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service';
import { SessionService } from '../sessions/session.service';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';
import { ConfigService } from 'config/config.service';
import { getFirebaseAuth } from 'config/firebase.config';

@Injectable()
export class AuthService implements OnModuleInit {
  private firebaseAuth: admin.auth.Auth;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private sessionService: SessionService,
    private emailService: EmailService,
    private config: ConfigService,
  ) {}

  onModuleInit() {
    // Get Firebase auth after module initialization
    try {
      this.firebaseAuth = getFirebaseAuth();
      this.logger.log(
        'Firebase Auth initialized in AuthService',
        'AuthService',
      );
    } catch (error) {
      this.logger.error(
        'Failed to get Firebase Auth',
        error.stack,
        'AuthService',
      );
      throw error;
    }
  }

  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private getLocationString(locationData?: any): string | undefined {
    if (!locationData) return undefined;

    const parts: string[] = [];
    if (locationData.city) parts.push(locationData.city);
    if (locationData.region) parts.push(locationData.region);
    if (locationData.country) parts.push(locationData.country);

    return parts.length > 0 ? parts.join(', ') : undefined;
  }

  async registerUser(dto: RegisterUserDto, context?: any) {
    try {
      // Check if user exists in DB
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        this.logger.warn(
          `Registration attempt with existing email: ${dto.email}`,
          'AuthService',
        );
        throw new BadRequestException('Email already registered');
      }

      // Create user in Firebase
      let firebaseUser: admin.auth.UserRecord;
      try {
        firebaseUser = await this.firebaseAuth.createUser({
          email: dto.email,
          password: dto.password,
          displayName: dto.fullName,
          emailVerified: false,
        });
      } catch (firebaseError: any) {
        this.logger.error(
          'Firebase user creation failed',
          firebaseError.stack,
          'AuthService',
        );

        if (firebaseError.code === 'auth/email-already-exists') {
          throw new BadRequestException(
            'Email already registered in authentication system',
          );
        } else if (firebaseError.code === 'auth/invalid-email') {
          throw new BadRequestException('Invalid email address');
        } else if (firebaseError.code === 'auth/weak-password') {
          throw new BadRequestException('Password is too weak');
        }

        throw new BadRequestException(
          'Failed to create user account. Please try again.',
        );
      }

      // Create user in database
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          firebaseUid: firebaseUser.uid,
          fullName: dto.fullName,
          role: 'USER',
        },
      });

      // Generate and save OTP
      const otp = this.generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      await this.prisma.otp.create({
        data: {
          email: dto.email,
          code: otp,
          expiresAt,
          userId: user.id,
        },
      });

      // Send verification email with context
      await this.emailService.sendVerificationEmail({
        email: dto.email,
        name: dto.fullName,
        otp: otp,
        ipAddress: context?.ipAddress,
        location: this.getLocationString(context?.locationData),
        userAgent: context?.userAgent,
        isAdmin: false,
      });

      this.logger.activity('USER_REGISTERED', user.id, {
        email: dto.email,
        firebaseUid: firebaseUser.uid,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      });

      return {
        message:
          'User registered successfully. Please verify your email with the OTP sent.',
        userId: user.id,
        email: user.email,
        expiresIn: '30 minutes',
      };
    } catch (error) {
      this.logger.error('Registration failed', error.stack, 'AuthService');
      throw error;
    }
  }

  async registerAdmin(dto: RegisterAdminDto, context?: any) {
    try {
      // Check if admin exists in DB
      const existingAdmin = await this.prisma.admin.findUnique({
        where: { email: dto.email },
      });

      if (existingAdmin) {
        this.logger.warn(
          `Admin registration attempt with existing email: ${dto.email}`,
          'AuthService',
        );
        throw new BadRequestException('Email already registered as admin');
      }

      // Create admin in Firebase
      let firebaseAdmin: admin.auth.UserRecord;
      try {
        firebaseAdmin = await this.firebaseAuth.createUser({
          email: dto.email,
          password: dto.password,
          displayName: dto.fullName,
          emailVerified: false,
        });
      } catch (firebaseError: any) {
        this.logger.error(
          'Firebase admin creation failed',
          firebaseError.stack,
          'AuthService',
        );
        throw new BadRequestException('Failed to create admin account');
      }

      // Create admin in database
      const admin = await this.prisma.admin.create({
        data: {
          email: dto.email,
          firebaseUid: firebaseAdmin.uid,
          fullName: dto.fullName,
          role: 'ADMIN',
        },
      });

      // Generate and save OTP
      const otp = this.generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      await this.prisma.otp.create({
        data: {
          email: dto.email,
          code: otp,
          expiresAt,
          adminId: admin.id,
        },
      });

      // Send verification email with context
      await this.emailService.sendVerificationEmail({
        email: dto.email,
        name: dto.fullName,
        otp: otp,
        ipAddress: context?.ipAddress,
        location: this.getLocationString(context?.locationData),
        userAgent: context?.userAgent,
        isAdmin: true,
      });

      this.logger.activity('ADMIN_REGISTERED', admin.id, {
        email: dto.email,
        firebaseUid: firebaseAdmin.uid,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      });

      return {
        message:
          'Admin registered successfully. Please verify your email with the OTP sent.',
        adminId: admin.id,
        email: admin.email,
        expiresIn: '30 minutes',
      };
    } catch (error) {
      this.logger.error(
        'Admin registration failed',
        error.stack,
        'AuthService',
      );
      throw error;
    }
  }

  async login(dto: LoginDto, context: any) {
    try {
      // Try to find user or admin
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        include: { companyData: true },
      });

      const admin = await this.prisma.admin.findUnique({
        where: { email: dto.email },
      });

      if (!user && !admin) {
        this.logger.warn(
          `Login attempt with non-existent email: ${dto.email}`,
          'AuthService',
        );
        throw new UnauthorizedException('Invalid email or password');
      }

      const accountType = user ? 'user' : 'admin';
      const account = user || admin;

      // Type guard to ensure account is not null
      if (!account) {
        throw new UnauthorizedException('Account not found');
      }

      const firebaseUid = account.firebaseUid;

      // Get user from Firebase to verify email
      let firebaseUser: admin.auth.UserRecord;
      try {
        firebaseUser = await this.firebaseAuth.getUser(firebaseUid);
      } catch (error) {
        this.logger.error(
          'Firebase user fetch failed',
          error.stack,
          'AuthService',
        );
        throw new UnauthorizedException('Authentication failed');
      }

      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        // Generate new OTP for verification
        const otp = this.generateOTP();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);

        await this.prisma.otp.create({
          data: {
            email: dto.email,
            code: otp,
            expiresAt,
            userId: user?.id,
            adminId: admin?.id,
          },
        });

        // Resend verification email
        await this.emailService.sendVerificationEmail({
          email: dto.email,
          name: account.fullName,
          otp: otp,
          ipAddress: context?.ipAddress,
          location: this.getLocationString(context?.locationData),
          userAgent: context?.userAgent,
          isAdmin: accountType === 'admin',
        });

        throw new UnauthorizedException(
          'Please verify your email first. A new verification code has been sent.',
        );
      }

      // Create session (this will invalidate any existing sessions)
      const session = await this.sessionService.createSession({
        firebaseUid,
        email: dto.email,
        token: dto.firebaseToken || '', // Client should send Firebase ID token
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        location: context?.locationData,
        userId: user?.id,
        adminId: admin?.id,
      });

      // Send login notification
      if (this.config.isProduction) {
        await this.emailService
          .sendLoginNotification({
            email: dto.email,
            name: account.fullName,
            ipAddress: context?.ipAddress || 'Unknown',
            location:
              this.getLocationString(context?.locationData) ||
              'Unknown location',
            userAgent: context?.userAgent || 'Unknown device',
            time: new Date(),
          })
          .catch((err) => {
            this.logger.error(
              'Failed to send login notification',
              err.stack,
              'AuthService',
            );
          });
      }

      this.logger.activity('LOGIN_SUCCESS', account.id, {
        email: dto.email,
        accountType,
        sessionId: session.id,
        ipAddress: context?.ipAddress,
      });

      // Prepare response based on account type
      if (user) {
        return {
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
          sessionId: session.id,
          accountType: 'user',
          hasCompanyData: !!user.companyData,
        };
      } else if (admin) {
        return {
          message: 'Login successful',
          admin: {
            id: admin.id,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role,
          },
          sessionId: session.id,
          accountType: 'admin',
        };
      }

      throw new UnauthorizedException('Invalid account type');
    } catch (error) {
      this.logger.error('Login failed', error.stack, 'AuthService');
      throw error;
    }
  }

  async logout(token: string) {
    try {
      await this.sessionService.invalidateSession(token);
      this.logger.activity('LOGOUT', undefined, { token });
      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error('Logout failed', error.stack, 'AuthService');
      throw new InternalServerErrorException('Failed to logout');
    }
  }

  async verifyOtp(email: string, otp: string) {
    try {
      const otpRecord = await this.prisma.otp.findFirst({
        where: {
          email,
          code: otp,
          used: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!otpRecord) {
        this.logger.warn(
          `Invalid OTP attempt for email: ${email}`,
          'AuthService',
        );
        throw new BadRequestException('Invalid or expired OTP');
      }

      // Mark OTP as used
      await this.prisma.otp.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });

      // Update email verification status in Firebase and database
      if (otpRecord.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: otpRecord.userId },
        });

        if (user) {
          await this.firebaseAuth.updateUser(user.firebaseUid, {
            emailVerified: true,
          });

          await this.prisma.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true },
          });

          // Send welcome email
          await this.emailService.sendWelcomeEmail({
            email: user.email,
            name: user.fullName,
            isAdmin: false,
          });

          this.logger.activity('EMAIL_VERIFIED', user.id, { email });
        }
      } else if (otpRecord.adminId) {
        const admin = await this.prisma.admin.findUnique({
          where: { id: otpRecord.adminId },
        });

        if (admin) {
          await this.firebaseAuth.updateUser(admin.firebaseUid, {
            emailVerified: true,
          });

          await this.prisma.admin.update({
            where: { id: admin.id },
            data: { isEmailVerified: true },
          });

          // Send welcome email
          await this.emailService.sendWelcomeEmail({
            email: admin.email,
            name: admin.fullName,
            isAdmin: true,
          });

          this.logger.activity('ADMIN_EMAIL_VERIFIED', admin.id, { email });
        }
      }

      return {
        message: 'Email verified successfully',
        verified: true,
      };
    } catch (error) {
      this.logger.error('OTP verification failed', error.stack, 'AuthService');
      throw error;
    }
  }

  async resendOtp(email: string, context?: any) {
    try {
      // Find user or admin
      const user = await this.prisma.user.findUnique({ where: { email } });
      const admin = await this.prisma.admin.findUnique({ where: { email } });

      if (!user && !admin) {
        // Don't reveal if email exists for security
        return {
          message: 'If the email exists, a new verification code has been sent',
        };
      }

      const account = user || admin;

      // Type guard to ensure account is not null
      if (!account) {
        return {
          message: 'If the email exists, a new verification code has been sent',
        };
      }

      // Invalidate old OTPs
      await this.prisma.otp.updateMany({
        where: {
          email,
          used: false,
        },
        data: { used: true },
      });

      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      await this.prisma.otp.create({
        data: {
          email,
          code: otp,
          expiresAt,
          userId: user?.id,
          adminId: admin?.id,
        },
      });

      // Send verification email
      if (user) {
        await this.emailService.sendVerificationEmail({
          email,
          name: user.fullName,
          otp,
          ipAddress: context?.ipAddress,
          location: this.getLocationString(context?.locationData),
          userAgent: context?.userAgent,
          isAdmin: false,
        });
      } else if (admin) {
        await this.emailService.sendVerificationEmail({
          email,
          name: admin.fullName,
          otp,
          ipAddress: context?.ipAddress,
          location: this.getLocationString(context?.locationData),
          userAgent: context?.userAgent,
          isAdmin: true,
        });
      }

      this.logger.activity('OTP_RESENT', account.id, { email });

      return {
        message: 'A new verification code has been sent to your email',
        expiresIn: '30 minutes',
      };
    } catch (error) {
      this.logger.error('Resend OTP failed', error.stack, 'AuthService');
      throw new InternalServerErrorException(
        'Failed to resend verification code',
      );
    }
  }

  async forgotPassword(email: string, context?: any) {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({ where: { email } });
      const admin = await this.prisma.admin.findUnique({ where: { email } });

      if (!user && !admin) {
        // Don't reveal if email exists for security
        return {
          message: 'If the email exists, a password reset link has been sent',
        };
      }

      const account = user || admin;

      // Type guard to ensure account is not null
      if (!account) {
        return {
          message: 'If the email exists, a password reset link has been sent',
        };
      }

      // Generate password reset link via Firebase
      const resetLink =
        await this.firebaseAuth.generatePasswordResetLink(email);

      // Send password reset email
      await this.emailService.sendPasswordResetEmail({
        email,
        name: account.fullName,
        resetLink,
        ipAddress: context?.ipAddress,
        location: this.getLocationString(context?.locationData),
        userAgent: context?.userAgent,
      });

      this.logger.activity('PASSWORD_RESET_REQUESTED', account.id, {
        email,
        ipAddress: context?.ipAddress,
      });

      return {
        message: 'Password reset instructions have been sent to your email',
        expiresIn: '1 hour',
      };
    } catch (error) {
      this.logger.error(
        'Forgot password request failed',
        error.stack,
        'AuthService',
      );
      throw new InternalServerErrorException(
        'Failed to process password reset request',
      );
    }
  }

  async resetPassword(oobCode: string, newPassword: string) {
    try {
      // Verify the OOB code (Firebase reset code)
      let email: string;
      try {
        email = await this.firebaseAuth.verifyPasswordResetCode(oobCode);
        this.logger.log(
          `Password reset verified for email: ${email}`,
          'AuthService',
        );
      } catch (error: any) {
        this.logger.warn(
          `Invalid password reset token attempt: ${error.message}`,
          'AuthService',
        );
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Confirm password reset
      await this.firebaseAuth.confirmPasswordReset(oobCode, newPassword);

      this.logger.activity('PASSWORD_RESET_COMPLETED', undefined, {
        resetTokenUsed: true,
        email,
      });

      return {
        message: 'Password has been reset successfully',
      };
    } catch (error: any) {
      this.logger.error('Password reset failed', error.stack, 'AuthService');

      // Handle specific Firebase errors
      if (error.code === 'auth/expired-oob-code') {
        throw new BadRequestException('Reset link has expired');
      } else if (error.code === 'auth/invalid-oob-code') {
        throw new BadRequestException('Invalid reset link');
      }

      throw error;
    }
  }
}
