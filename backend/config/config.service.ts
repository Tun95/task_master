import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import 'dotenv/config';

dotenv.config();

@Injectable()
export class ConfigService {
  constructor() {
    // Validate required environment variables
    this.validateConfig();
  }

  private validateConfig() {
    const required = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
      'EMAIL_USERNAME',
      'EMAIL_PASSWORD',
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`,
      );
    }
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  // App Config
  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  get port(): number {
    return parseInt(process.env.PORT || '5000', 10);
  }

  get appName(): string {
    return process.env.APP_NAME || 'TaskMaster';
  }

  get frontendUrl(): string {
    return process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  get adminFrontendUrl(): string {
    return process.env.ADMIN_FRONTEND_URL || 'http://localhost:3001';
  }

  get backendUrl(): string {
    return process.env.BACKEND_URL || 'http://localhost:5000';
  }

  get apiUrl(): string {
    return process.env.API_URL || 'http://localhost:5000/api';
  }

  // Database Config
  get databaseUrl(): string {
    return (
      process.env.DATABASE_URL ||
      'postgresql://postgres:password@localhost:5432/taskmaster'
    );
  }

  // Firebase Config
  get firebase() {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      firebaseApiKey: process.env.FIREBASE_API_KEY,
    };
  }

  // JWT Config (for custom tokens)
  get jwt() {
    return {
      secret: process.env.JWT_SECRET || 'taskmaster-super-secret-jwt-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    };
  }

  // Email Config (Gmail SMTP)
  get email() {
    return {
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      from: {
        address:
          process.env.EMAIL_FROM ||
          process.env.EMAIL_USERNAME ||
          'shopmate400@gmail.com',
        name: process.env.EMAIL_FROM_NAME || 'TaskMaster',
      },
    };
  }

  // Cloudinary Config
  get cloudinary() {
    return {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      url: process.env.CLOUDINARY_URL,
    };
  }

  // Company Info
  get company() {
    return {
      name: process.env.COMPANY_NAME || 'TaskMaster Inc.',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@taskmaster.com',
      contactEmail: process.env.CONTACT_EMAIL || 'info@taskmaster.com',
      contactPhone: process.env.CONTACT_PHONE || '+1 (555) 123-4567',
      address:
        process.env.COMPANY_ADDRESS ||
        '123 Business Ave, Suite 100, San Francisco, CA 94105',
      website: process.env.COMPANY_WEBSITE || 'https://taskmaster.com',
    };
  }

  // Social Media Links
  get social() {
    return {
      facebook:
        process.env.FACEBOOK_PROFILE_LINK || 'https://facebook.com/taskmaster',
      instagram:
        process.env.INSTAGRAM_PROFILE_LINK ||
        'https://instagram.com/taskmaster',
      twitter:
        process.env.TWITTER_PROFILE_LINK || 'https://twitter.com/taskmaster',
      linkedin:
        process.env.LINKEDIN_PROFILE_LINK ||
        'https://linkedin.com/company/taskmaster',
    };
  }

  // Security
  get adminSecretKey(): string {
    return process.env.ADMIN_SECRET_KEY || 'taskmaster-secret-key';
  }

  // File Upload
  get fileUpload() {
    return {
      maxSize: parseInt(process.env.MAX_UPLOAD_SIZE || '5242880', 10), // 5MB default
      allowedMimeTypes: (
        process.env.ALLOWED_MIME_TYPES ||
        'image/jpeg,image/png,image/gif,image/webp'
      ).split(','),
    };
  }
}
