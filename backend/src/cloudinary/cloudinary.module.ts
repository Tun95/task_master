import { Module } from '@nestjs/common';
import { ConfigModule } from 'config/config.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
