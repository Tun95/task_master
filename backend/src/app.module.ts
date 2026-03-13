import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './utils/sessions/sessions.module'; // Add this
import { PrismaModule } from './utils/prisma/prisma.module';
import { LoggerModule } from './utils/common/logger/logger.module';
import { EmailModule } from './utils/email/email.module';
import { RequestLoggerMiddleware } from './utils/common/middleware/logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CronModule } from './utils/cron/cron.module';
import { ConfigModule } from '@/config/config.module';
import { UserModule } from './user/user.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule,
    SessionsModule,
    AuthModule,
    UserModule,
    PrismaModule,
    LoggerModule,
    EmailModule,
    CloudinaryModule,
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
