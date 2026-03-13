import { Express } from 'express';
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseAuthGuard } from '../utils/common/guards/firebase-auth.guard';
import { UserService } from './user.service';
import { LoggerService } from '@/utils/common/logger/logger.service';
import { RolesGuard } from '@/utils/common/guards/roles.guard';
import { Roles } from '@/utils/common/decorators/roles.decorator';
import { User } from '@/utils/common/decorators/user.decorator';
import { CreateCompanyDataDto } from './dto/company-data.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  // ============ USER ENDPOINTS ============

  @Post('company-data')
  async createCompanyData(
    @User() user: any,
    @Body() createDto: CreateCompanyDataDto,
  ) {
    this.logger.activity('CREATE_COMPANY_DATA', user.id);
    return this.userService.createCompanyData(user.id, createDto);
  }

  @Get('profile')
  async getMyProfile(@User() user: any) {
    this.logger.activity('GET_MY_PROFILE', user.id);
    return this.userService.getProfile(user.id, user.role.toLowerCase());
  }

  @Patch('profile')
  async updateMyProfile(
    @User() user: any,
    @Body() updateDto: UpdateProfileDto,
  ) {
    this.logger.activity('UPDATE_MY_PROFILE', user.id);
    return this.userService.updateProfile(
      user.id,
      user.role.toLowerCase(),
      updateDto,
    );
  }

  // ============ ADMIN ENDPOINTS ============

  @Get('admin/users/stats')
  @Roles('ADMIN')
  async getUserStats() {
    this.logger.activity('ADMIN_GET_USER_STATS');
    return this.userService.getUserStats();
  }

  @Get('admin/users')
  @Roles('ADMIN')
  async getAllUsers(@Query() filterDto: UserFilterDto) {
    this.logger.activity('ADMIN_FETCH_ALL_USERS', undefined, {
      filter: filterDto,
    });
    return this.userService.getAllUsers(filterDto);
  }

  @Get('admin/users/:userId')
  @Roles('ADMIN')
  async getUserById(@Param('userId') userId: string) {
    this.logger.activity('ADMIN_GET_USER_BY_ID', undefined, { userId });
    return this.userService.getUserById(userId);
  }

  // Admin can view any user's profile
  @Get('admin/profile/:userId')
  @Roles('ADMIN')
  async getAdminUserProfile(@Param('userId') userId: string) {
    this.logger.activity('ADMIN_GET_USER_PROFILE', undefined, {
      targetUserId: userId,
    });
    return this.userService.getProfile(userId, 'user');
  }

  // Admin can update any user's profile
  @Patch('admin/profile/:userId')
  @Roles('ADMIN')
  async updateAdminUserProfile(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateProfileDto,
  ) {
    this.logger.activity('ADMIN_UPDATE_USER_PROFILE', undefined, {
      targetUserId: userId,
      updates: updateDto,
    });
    return this.userService.updateProfile(userId, 'user', updateDto);
  }

  @Post('admin/upload-to-user/:userId')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImageToUser(
    @User() admin: any,
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.activity('ADMIN_UPLOAD_IMAGE_TO_USER', admin.id, {
      targetUserId: userId,
    });
    return this.userService.uploadImageToUser(admin.id, userId, file);
  }

  @Get('admin/user-dashboard/:userId')
  @Roles('ADMIN')
  async getUserDashboard(@Param('userId') userId: string) {
    this.logger.activity('ADMIN_FETCH_USER_DASHBOARD', undefined, { userId });
    return this.userService.getUserDashboard(userId);
  }
}
