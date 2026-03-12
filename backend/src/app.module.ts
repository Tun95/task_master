import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module'; // Add this
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { EmailModule } from './email/email.module';
import { RequestLoggerMiddleware } from './common/middleware/logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CronModule } from './cron/cron.module';
import { ConfigModule } from 'config/config.module';

@Module({
  imports: [
    ConfigModule,
    SessionsModule,
    AuthModule,
    PrismaModule,
    LoggerModule,
    EmailModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
