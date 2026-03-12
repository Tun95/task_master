import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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

  // ============  (ADMIN) ENDPOINTS ============

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
