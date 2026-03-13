// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@config/config.service';
import { initializeFirebase } from '@config/firebase.config';
import * as express from 'express';

async function bootstrap() {
  const configService = new ConfigService();

  // Initialize Firebase first
  try {
    initializeFirebase(configService);
    console.log('🔥 Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Root status endpoint
  const rootRouter = express.Router();
  rootRouter.get('/', (req, res) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'TaskMaster API',
      uptime: process.uptime(),
      environment: configService.nodeEnv,
      firebase: 'connected',
    });
  });
  app.use(rootRouter);

  // Health check endpoint
  const healthRouter = express.Router();
  healthRouter.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  app.use(healthRouter);

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

  const port = process.env.PORT || configService.port || 5000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 TaskMaster API running on: http://0.0.0.0:${port}/api`);
  console.log(`📝 Environment: ${configService.nodeEnv}`);
  console.log(`💓 Status check available at: http://0.0.0.0:${port}/health`);
}
bootstrap();
