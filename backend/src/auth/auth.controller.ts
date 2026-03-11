import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Headers,
} from '@nestjs/common';
import { SessionService } from './session.service';

import { Request } from 'express';
import { LoggerService } from '../common/logger/logger.service';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { AuthService } from './auth.service';
import { User } from 'src/common/decorators/user.decorator';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly logger: LoggerService,
  ) {}

  @Post('register/user')
  async registerUser(
    @Body() registerDto: RegisterUserDto,
    @Req() req: Request,
  ) {
    const context = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      locationData: registerDto.location_data,
    };

    return this.authService.registerUser(registerDto, context);
  }

  @Post('register/admin')
  async registerAdmin(
    @Body() registerDto: RegisterAdminDto,
    @Req() req: Request,
  ) {
    const context = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      locationData: registerDto.location_data,
    };

    return this.authService.registerAdmin(registerDto, context);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const context = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      locationData: loginDto.location_data,
    };

    return this.authService.login(loginDto, context);
  }

  @Post('logout')
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Headers('authorization') auth: string) {
    const token = auth.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyDto.email, verifyDto.otp);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() resendDto: ResendOtpDto) {
    return this.authService.resendOtp(resendDto.email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotDto.email);
  }

  @Get('profile')
  @UseGuards(FirebaseAuthGuard)
  async getProfile(@User() user: any) {
    return this.authService.getProfile(user.firebaseUid);
  }

  @Get('sessions/active')
  @UseGuards(FirebaseAuthGuard)
  async getActiveSession(@Headers('authorization') auth: string) {
    const token = auth.replace('Bearer ', '');
    const session = await this.sessionService.getActiveSession(token);
    return { session };
  }

  @Post('sessions/invalidate-all')
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  async invalidateAllSessions(@User() user: any) {
    await this.sessionService.invalidateAllUserSessions(user.firebaseUid);
    return { message: 'All sessions invalidated' };
  }
}
