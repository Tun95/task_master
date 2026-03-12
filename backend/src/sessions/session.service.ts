import { Module } from '@nestjs/common';
import { SessionsModule } from '../sessions/sessions.module'; // Import SessionsModule
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';
import { EmailModule } from '../email/email.module';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { FirebaseAuthGuard } from '@/auth/guards/firebase-auth.guard';

@Module({
  imports: [PrismaModule, LoggerModule, EmailModule, SessionsModule], // Add SessionsModule
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
