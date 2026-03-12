import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SessionService } from '../sessions/session.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { AuthService } from './auth.service';
import { LoggerModule } from 'src/common/logger/logger.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [PrismaModule, LoggerModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService, SessionService, FirebaseAuthGuard],
  exports: [AuthService, SessionService, FirebaseAuthGuard],
})
export class AuthModule {}
