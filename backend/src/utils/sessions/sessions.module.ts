import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';
import { SessionService } from '@/utils/sessions/session.service';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionsModule {}
