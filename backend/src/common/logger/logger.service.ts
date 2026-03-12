import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logsDir = path.join(process.cwd(), 'logs');

  constructor() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  // Sanitize sensitive data from objects
  private sanitizeData(data: any): any {
    if (!data) return data;

    // Create a deep copy to avoid mutating original
    const sanitized = JSON.parse(JSON.stringify(data));

    // List of sensitive fields to mask or remove
    const sensitiveFields = [
      'password',
      'newPassword',
      'currentPassword',
      'adminSecret',
      'token',
      'refreshToken',
    ];
    const sensitivePatterns = [/^otp$/i, /^pin$/i, /^secret$/i];

    const sanitizeObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;

      Object.keys(obj).forEach((key) => {
        // Check if key is sensitive
        if (sensitiveFields.includes(key.toLowerCase())) {
          obj[key] = '********';
        }

        // Check patterns
        for (const pattern of sensitivePatterns) {
          if (pattern.test(key)) {
            obj[key] = '********';
            break;
          }
        }

        // Recursively sanitize nested objects
        if (obj[key] && typeof obj[key] === 'object') {
          sanitizeObject(obj[key]);
        }
      });
    };

    sanitizeObject(sanitized);
    return sanitized;
  }

  // Truncate long strings (like HTML content)
  private truncateString(str: string, maxLength: number = 200): string {
    if (!str || typeof str !== 'string') return str;
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  }

  // Sanitize message content
  private sanitizeMessage(message: any): any {
    if (typeof message === 'string') {
      // Check if it looks like HTML
      if (message.trim().startsWith('<') && message.includes('</')) {
        return '[HTML CONTENT HIDDEN]';
      }

      // Check if it contains sensitive patterns
      const sensitivePatterns = [
        /password["']?\s*[:=]\s*["'][^"']*["']/gi,
        /otp["']?\s*[:=]\s*["'][^"']*["']/gi,
        /token["']?\s*[:=]\s*["'][^"']*["']/gi,
        /secret["']?\s*[:=]\s*["'][^"']*["']/gi,
      ];

      let sanitized = message;
      for (const pattern of sensitivePatterns) {
        sanitized = sanitized.replace(pattern, (match) => {
          const [key] = match.split(/[:=]/);
          return `${key}: "********"`;
        });
      }

      return this.truncateString(sanitized);
    }

    if (typeof message === 'object' && message !== null) {
      return this.sanitizeData(message);
    }

    return message;
  }

  log(message: any, context?: string) {
    const sanitizedMessage = this.sanitizeMessage(message);
    this.writeToFile('info', sanitizedMessage, context);
    console.log(`📗 [${context || 'APP'}]`, sanitizedMessage);
  }

  error(message: any, trace?: string, context?: string) {
    const sanitizedMessage = this.sanitizeMessage(message);
    this.writeToFile('error', sanitizedMessage, context, trace);
    console.error(`📕 [${context || 'APP'}]`, sanitizedMessage);
    if (trace) console.error(trace);
  }

  warn(message: any, context?: string) {
    const sanitizedMessage = this.sanitizeMessage(message);
    this.writeToFile('warn', sanitizedMessage, context);
    console.warn(`📙 [${context || 'APP'}]`, sanitizedMessage);
  }

  debug(message: any, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      const sanitizedMessage = this.sanitizeMessage(message);
      this.writeToFile('debug', sanitizedMessage, context);
      console.debug(`📘 [${context || 'APP'}]`, sanitizedMessage);
    }
  }

  verbose(message: any, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      const sanitizedMessage = this.sanitizeMessage(message);
      this.writeToFile('verbose', sanitizedMessage, context);
      console.log(`📓 [${context || 'APP'}]`, sanitizedMessage);
    }
  }

  activity(activity: string, userId?: string, metadata?: any) {
    // Sanitize metadata before logging
    const sanitizedMetadata = this.sanitizeData(metadata);

    // Remove any HTML content from metadata
    if (sanitizedMetadata?.html) {
      sanitizedMetadata.html = '[HTML CONTENT HIDDEN]';
    }

    // Truncate long strings in metadata
    if (sanitizedMetadata?.body?.fullName) {
      // nothing here keep as it is
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'ACTIVITY',
      activity,
      userId,
      metadata: sanitizedMetadata,
    };

    const activityFile = path.join(
      this.logsDir,
      `activity-${new Date().toISOString().split('T')[0]}.log`,
    );
    fs.appendFileSync(activityFile, JSON.stringify(logEntry) + '\n');

    // Console output with sanitized data
    const consoleMetadata = { ...sanitizedMetadata };

    // Remove large content from console output
    if (consoleMetadata.body?.password) {
      consoleMetadata.body.password = '********';
    }
    if (consoleMetadata.html) {
      delete consoleMetadata.html;
    }

    console.log(
      `🔹 [ACTIVITY] ${activity}`,
      Object.keys(consoleMetadata).length
        ? JSON.stringify(consoleMetadata)
        : '',
    );
  }

  private writeToFile(
    level: string,
    message: any,
    context?: string,
    trace?: string,
  ) {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logsDir, `${date}.log`);

    // Final sanitization for file output
    let finalMessage = message;
    if (typeof message === 'string' && message.length > 1000) {
      finalMessage = message.substring(0, 1000) + '... [TRUNCATED]';
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message:
        typeof finalMessage === 'string'
          ? finalMessage
          : JSON.stringify(finalMessage),
      trace,
    };

    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }
}
