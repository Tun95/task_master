// backend/src/main.ts
import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@config/config.service';
import { initializeFirebase } from '@config/firebase.config';
import * as express from 'express';

// Add top-level error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  console.error('Error stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 UNHANDLED REJECTION:', reason);
  process.exit(1);
});

async function bootstrap() {
  console.log('🚀 Starting bootstrap...');
  console.log('1. Current directory:', process.cwd());
  console.log('2. Node version:', process.version);

  // Log environment variables (without sensitive data)
  console.log('3. NODE_ENV:', process.env.NODE_ENV);
  console.log('4. PORT from env:', process.env.PORT);

  let configService;
  try {
    console.log('5. Creating ConfigService...');
    configService = new ConfigService();
    console.log('6. ConfigService created');
    console.log('7. NodeEnv from config:', configService.nodeEnv);
  } catch (error) {
    console.error('❌ ConfigService failed:', error);
    throw error;
  }

  // Initialize Firebase first
  try {
    console.log('8. Initializing Firebase...');
    initializeFirebase(configService);
    console.log('9. ✅ Firebase initialized');
  } catch (error) {
    console.error('❌ Firebase failed:', error);
    throw error;
  }

  try {
    console.log('10. Creating Nest application...');
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    console.log('11. ✅ Nest app created');

    // Root endpoint
    console.log('12. Setting up routes...');
    const rootRouter = express.Router();
    rootRouter.get('/', (req, res) => {
      res.json({ status: 'UP' });
    });
    app.use(rootRouter);

    // Health check
    const healthRouter = express.Router();
    healthRouter.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });
    app.use(healthRouter);

    console.log('13. Applying middleware...');
    app.use(helmet());

    console.log('14. Configuring CORS...');
    app.enableCors({
      origin: configService.frontendUrl || 'http://localhost:3000',
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix('api');

    const port = process.env.PORT || configService.port || 5000;
    console.log(`15. Attempting to listen on 0.0.0.0:${port}...`);

    await app.listen(port, '0.0.0.0');
    console.log(`16. ✅ Server listening on port ${port}`);
  } catch (error) {
    console.error('❌ Fatal error in bootstrap:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

console.log('⚡ Starting bootstrap function...');
bootstrap().catch((error) => {
  console.error('💥 Bootstrap promise rejected:', error);
  process.exit(1);
});
