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

  log(message: any, context?: string) {
    this.writeToFile('info', message, context);
    console.log(`📗 [${context || 'APP'}] ${message}`);
  }

  error(message: any, trace?: string, context?: string) {
    this.writeToFile('error', message, context, trace);
    console.error(`📕 [${context || 'APP'}] ${message}`);
    if (trace) console.error(trace);
  }

  warn(message: any, context?: string) {
    this.writeToFile('warn', message, context);
    console.warn(`📙 [${context || 'APP'}] ${message}`);
  }

  debug(message: any, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.writeToFile('debug', message, context);
      console.debug(`📘 [${context || 'APP'}] ${message}`);
    }
  }

  activity(activity: string, userId?: string, metadata?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'ACTIVITY',
      activity,
      userId,
      metadata,
    };

    const activityFile = path.join(
      this.logsDir,
      `activity-${new Date().toISOString().split('T')[0]}.log`,
    );
    fs.appendFileSync(activityFile, JSON.stringify(logEntry) + '\n');

    console.log(
      `🔹 [ACTIVITY] ${activity}`,
      metadata ? JSON.stringify(metadata) : '',
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

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      trace,
    };

    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }
}
