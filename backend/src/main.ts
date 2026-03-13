import 'module-alias/register';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@config/config.service';
import { initializeFirebase } from '@config/firebase.config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialize Firebase
  const configService = new ConfigService();
  try {
    initializeFirebase(configService);
    console.log('🔥 Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    process.exit(1);
  }

  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 TaskMaster API running on http://0.0.0.0:${port}/api`);
}
bootstrap();
