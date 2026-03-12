import {
  Controller,
  Get,
  Post,
  Put,
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
import { UserFilterDto } from './dto/user-filter.dto';
import { Roles } from '@/utils/common/decorators/roles.decorator';
import { User } from '@/utils/common/decorators/user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  CreateCompanyDataDto,
  UpdateCompanyDataDto,
} from './dto/company-data.dto';

@Controller('users')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  // ============  COMPANY DATA ENDPOINTS ============

  @Post('company-data')
  async createCompanyData(
    @User() user: any,
    @Body() createDto: CreateCompanyDataDto,
  ) {
    this.logger.activity('CREATE_COMPANY_DATA', user.id);
    return this.userService.createCompanyData(user.id, createDto);
  }

  @Get('company-data')
  async getCompanyData(@User() user: any) {
    this.logger.activity('GET_COMPANY_DATA', user.id);
    return this.userService.getCompanyData(user.id);
  }

  @Put('company-data')
  async updateCompanyData(
    @User() user: any,
    @Body() updateDto: UpdateCompanyDataDto,
  ) {
    this.logger.activity('UPDATE_COMPANY_DATA', user.id, {
      updates: Object.keys(updateDto),
    });
    return this.userService.updateCompanyData(user.id, updateDto);
  }

  // ============ IMAGE UPLOAD ENDPOINTS ============

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

  // REMOVE
  @Get('admin/user-images/:userId')
  @Roles('ADMIN')
  async getUserImages(@Param('userId') userId: string) {
    this.logger.activity('ADMIN_FETCH_USER_IMAGES', undefined, { userId });
    return this.userService.getUserImages(userId);
  }

  // REMOVE
  @Get('admin/user-recent-image/:userId')
  @Roles('ADMIN')
  async getMostRecentImage(@Param('userId') userId: string) {
    this.logger.activity('ADMIN_FETCH_RECENT_IMAGE', undefined, { userId });
    return this.userService.getMostRecentImage(userId);
  }

  @Get('admin/user-dashboard/:userId')
  @Roles('ADMIN')
  async getUserDashboard(@Param('userId') userId: string) {
    this.logger.activity('ADMIN_FETCH_USER_DASHBOARD', undefined, { userId });
    return this.userService.getUserDashboard(userId);
  }

  // ============ OPTIONAL: PROFILE ENDPOINTS (Only added for fun) ============

  @Get('profile')
  async getProfile(@User() user: any) {
    this.logger.activity('FETCH_PROFILE', user.id);
    return this.userService.getProfile(user.id, user.userType);
  }

  @Put('profile')
  async updateProfile(@User() user: any, @Body() updateDto: UpdateProfileDto) {
    this.logger.activity('UPDATE_PROFILE', user.id, {
      updates: Object.keys(updateDto),
    });
    return this.userService.updateProfile(user.id, user.userType, updateDto);
  }

  // ============ TEST ENDPOINT FOR PERCENTAGE CALCULATION ============

  @Get('company-data/percentage')
  async calculatePercentage(
    @User() user: any,
    @Query('users') users?: number,
    @Query('products') products?: number,
  ) {
    if (users && products) {
      const percentage = (products / users) * 100;
      return { percentage: parseFloat(percentage.toFixed(2)) };
    }

    const companyData = await this.userService.getCompanyData(user.id);
    return companyData;
  }

  // ============ ADMIN ENDPOINTS (for user management) ============

  @Get('admin/all')
  @Roles('ADMIN')
  async getAllUsers(@Query() filterDto: UserFilterDto) {
    this.logger.activity('ADMIN_FETCH_ALL_USERS', undefined, {
      filter: filterDto,
    });
    return this.userService.findAll(filterDto);
  }

  @Get('admin/user/:id')
  @Roles('ADMIN')
  async getUserById(@Param('id') id: string) {
    this.logger.activity('ADMIN_FETCH_USER_BY_ID', undefined, { userId: id });
    return this.userService.findById(id);
  }

  @Get('admin/stats')
  @Roles('ADMIN')
  async getUserStats() {
    this.logger.activity('ADMIN_FETCH_USER_STATS');
    return this.userService.getUserStats();
  }
}
