import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { Request } from 'express';
import { LoggerService } from '../common/logger/logger.service';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  // USER Register
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

  // Admin Register
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

  // Login
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

  // Logout
  @Post('logout')
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Headers('authorization') auth: string) {
    const token = auth.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  // Veriy otp
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyDto.email, verifyDto.otp);
  }

  // Resend OTP
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() resendDto: ResendOtpDto) {
    return this.authService.resendOtp(resendDto.email);
  }

  // Forgot password
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotDto.email);
  }

  // Reset Password
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetDto.oobCode,
      resetDto.newPassword,
    );
  }
}
