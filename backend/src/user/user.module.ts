import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { LoggerModule } from '@/utils/common/logger/logger.module';
import { PrismaModule } from '@/utils/prisma/prisma.module';
import { SessionsModule } from '@/utils/sessions/sessions.module'; // Add this import
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule, LoggerModule, CloudinaryModule, SessionsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
