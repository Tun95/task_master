import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionService } from '../sessions/session.service';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class SessionCleanupService {
  constructor(
    private sessionService: SessionService,
    private logger: LoggerService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleSessionCleanup() {
    this.logger.log(
      'Running expired sessions cleanup',
      'SessionCleanupService',
    );
    const count = await this.sessionService.cleanupExpiredSessions();
    if (count > 0) {
      this.logger.log(
        `Cleaned up ${count} expired sessions`,
        'SessionCleanupService',
      );
    }
  }
}
