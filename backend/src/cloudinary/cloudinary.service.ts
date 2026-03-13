import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@config/config.service';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.cloudinary.cloudName,
      api_key: this.config.cloudinary.apiKey,
      api_secret: this.config.cloudinary.apiSecret,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'users',
    userId?: string,
  ): Promise<any> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      // Check file type
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('Only image files are allowed');
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new BadRequestException('File size too large. Max 5MB');
      }

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `taskmaster/${folder}`,
            public_id: userId ? `${userId}-${Date.now()}` : undefined,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  async deleteImage(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new BadRequestException(`Failed to delete image: ${error.message}`);
    }
  }

  async getImageUrl(publicId: string, options?: any): Promise<string> {
    return cloudinary.url(publicId, {
      secure: true,
      ...options,
    });
  }
}
