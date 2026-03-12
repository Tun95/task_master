import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';
import { SessionsModule } from '../sessions/sessions.module'; // Import SessionsModule
import { SessionCleanupService } from './session-cleanup.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    LoggerModule,
    SessionsModule,
  ],
  providers: [SessionCleanupService],
})
export class CronModule {}
