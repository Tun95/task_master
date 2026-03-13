import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@/config/config.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private config: ConfigService) {
    // Create a PostgreSQL connection pool
    const pool = new Pool({
      connectionString: config.databaseUrl,
    });

    const adapter = new PrismaPg(pool as any);

    // Pass adapter to PrismaClient constructor
    super({
      adapter,
      log: config.isDevelopment ? ['error'] : ['error'],
      errorFormat: config.isDevelopment ? 'pretty' : 'minimal',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Failed to disconnect from database', error.stack);
    }
  }
}
