import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from 'config/config.service';
import { initializeFirebase } from 'config/firebase.config';

async function bootstrap() {
  // Create a temporary config service for Firebase initialization
  const configService = new ConfigService();

  // Initialize Firebase FIRST, before anything else
  try {
    initializeFirebase(configService);
    console.log('🔥 Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: configService.frontendUrl || 'http://localhost:3000',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  const port = configService.port || 5000;
  await app.listen(port);

  console.log(`🚀 TaskMaster API running on: http://localhost:${port}/api`);
  console.log(`📝 Environment: ${configService.nodeEnv}`);
}
bootstrap();
