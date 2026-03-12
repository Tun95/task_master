import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || 'unknown';

    const startTime = Date.now();

    // Log request
    this.logger.activity(`📥 ${method} ${originalUrl}`, undefined, {
      ip,
      userAgent,
      body: method !== 'GET' ? req.body : undefined,
    });

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      const level = statusCode >= 400 ? 'warn' : 'log';
      this.logger[level](
        `📤 ${method} ${originalUrl} ${statusCode} - ${duration}ms`,
        'HTTP',
      );

      // Log errors
      if (statusCode >= 500) {
        this.logger.error(
          `Server error: ${method} ${originalUrl} ${statusCode}`,
          undefined,
          'HTTP',
        );
      }
    });

    next();
  }
}
