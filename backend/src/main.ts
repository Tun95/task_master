// backend/src/main.ts
import 'module-alias/register';

// Add these handlers at the VERY TOP - BEFORE any other imports
process.on('uncaughtException', (error) => {
  console.error('\n🔥 UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n🔥 UNHANDLED REJECTION:', reason);
  process.exit(1);
});

console.log('\n🚀 Starting application...');
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

// Now safe to import other modules
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@config/config.service';
import { initializeFirebase } from '@config/firebase.config';
import * as express from 'express';

async function bootstrap() {
  try {
    console.log('\n1. Creating ConfigService...');
    const configService = new ConfigService();
    console.log('2. ConfigService created successfully');
    console.log('3. NODE_ENV:', configService.nodeEnv);
    console.log('4. PORT from env:', process.env.PORT);

    console.log('5. Initializing Firebase...');
    initializeFirebase(configService);
    console.log('6. Firebase initialized');

    console.log('7. Creating Nest application...');
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    console.log('8. Nest application created');

    console.log('9. Setting up routes...');
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

    console.log('10. Applying middleware...');
    app.use(helmet());

    console.log('11. Configuring CORS...');
    app.enableCors({
      origin: configService.frontendUrl || 'http://localhost:3000',
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix('api');

    const port = process.env.PORT || configService.port || 5000;
    console.log(`12. Attempting to listen on 0.0.0.0:${port}...`);

    await app.listen(port, '0.0.0.0');
    console.log(`13. ✅ SUCCESS! Server listening on port ${port}`);
    console.log(`Server address: ${await app.getUrl()}`);
  } catch (error) {
    console.error('\n❌ BOOTSTRAP ERROR:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.code) console.error('Error code:', error.code);
    throw error;
  }
}

bootstrap().catch((error) => {
  console.error('\n💥 FATAL ERROR:', error);
  process.exit(1);
});
