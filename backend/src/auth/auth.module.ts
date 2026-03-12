import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SessionService } from '../utils/sessions/session.service';
import { PrismaModule } from '../utils/prisma/prisma.module';
import { FirebaseAuthGuard } from '../utils/common/guards/firebase-auth.guard';
import { AuthService } from './auth.service';
import { LoggerModule } from '@/utils/common/logger/logger.module';
import { EmailModule } from '@/utils/email/email.module';

@Module({
  imports: [PrismaModule, LoggerModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService, SessionService, FirebaseAuthGuard],
  exports: [AuthService, SessionService, FirebaseAuthGuard],
})
export class AuthModule {}
