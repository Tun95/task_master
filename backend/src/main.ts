// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from 'config/config.service';
import { initializeFirebase } from 'config/firebase.config';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();

async function bootstrap() {
  // Temporary config service for Firebase initialization
  const configService = new ConfigService();

  // Initialize Firebase FIRST
  try {
    initializeFirebase(configService);
    console.log('🔥 Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    process.exit(1);
  }

  // Create Nest app with Express adapter
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

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
  server.use(rootRouter);

  // Security
  server.use(helmet());

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

  // Initialize app (no app.listen here!)
  await app.init();

  console.log(`🚀 TaskMaster API initialized`);
  console.log(`📝 Environment: ${configService.nodeEnv}`);
  console.log(`💓 Status check available at: /`);
}

// Run bootstrap once
bootstrap();

// Export Express server for Vercel
export default server;
