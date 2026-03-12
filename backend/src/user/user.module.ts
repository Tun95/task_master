import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { LoggerModule } from '@/utils/common/logger/logger.module';
import { PrismaModule } from '@/utils/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule, LoggerModule, CloudinaryModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
