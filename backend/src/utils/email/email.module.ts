import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@config/config.module';

@Module({
  imports: [ConfigModule], // Add this line
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
