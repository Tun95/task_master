import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';
import { SessionService } from '@/sessions/session.service';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [SessionService],
  exports: [SessionService], // Export so other modules can use it
})
export class SessionsModule {}
