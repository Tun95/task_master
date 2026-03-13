// backend/src/main.ts
import 'module-alias/register';

// Add these handlers at the VERY TOP
process.on('uncaughtException', (error) => {
  console.error('🔥 UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('🔥 UNHANDLED REJECTION:', reason);
  process.exit(1);
});

console.log('🚀 Starting application...');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);
console.log(
  'Environment variables present:',
  Object.keys(process.env).filter(
    (key) =>
      !key.includes('SECRET') &&
      !key.includes('KEY') &&
      !key.includes('PASSWORD'),
  ),
);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@config/config.service';
import { initializeFirebase } from '@config/firebase.config';
import * as express from 'express';

async function bootstrap() {
  try {
    console.log('1. Creating ConfigService...');
    const configService = new ConfigService();
    console.log('2. ConfigService created');

    console.log('3. Initializing Firebase...');
    initializeFirebase(configService);
    console.log('4. Firebase initialized');

    console.log('5. Creating Nest app...');
    const app = await NestFactory.create(AppModule);
    console.log('6. Nest app created');

    console.log('7. Setting up routes...');
    const rootRouter = express.Router();
    rootRouter.get('/', (req, res) => {
      res.json({ status: 'UP' });
    });
    app.use(rootRouter);

    const healthRouter = express.Router();
    healthRouter.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });
    app.use(healthRouter);

    console.log('8. Applying middleware...');
    app.use(helmet());
    app.enableCors({
      origin: configService.frontendUrl || 'http://localhost:3000',
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix('api');

    const port = process.env.PORT || configService.port || 5000;
    console.log(`9. Attempting to listen on 0.0.0.0:${port}...`);

    await app.listen(port, '0.0.0.0');
    console.log(`10. ✅ Server listening on port ${port}`);
  } catch (error) {
    console.error('❌ Bootstrap error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

bootstrap().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
