import { LoggerService } from '@/utils/common/logger/logger.service';
import { PrismaService } from '@/utils/prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCompanyDataDto } from './dto/company-data.dto';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cloudinary: CloudinaryService,
  ) {}

  // ============ USER COMPANY DATA METHODS ============
  async createCompanyData(userId: string, createDto: CreateCompanyDataDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate percentage (products per user * 100)
    // This shows what percentage of users are using products
    const percentage =
      (createDto.numberOfProducts / createDto.numberOfUsers) * 100;

    const companyData = await this.prisma.companyData.create({
      data: {
        companyName: createDto.companyName,
        numberOfUsers: createDto.numberOfUsers,
        numberOfProducts: createDto.numberOfProducts,
        percentage: parseFloat(percentage.toFixed(2)),
        userId,
      },
    });

    this.logger.activity('COMPANY_DATA_CREATED', userId, {
      companyName: createDto.companyName,
      percentage: companyData.percentage,
    });

    return {
      message: 'Company data submitted successfully',
      data: companyData,
    };
  }

  // ============  (ADMIN): IMAGE UPLOAD METHODS ============
  async uploadImageToUser(
    adminId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    // Check if target user exists (User A)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Target user not found');
    }

    // Check if admin exists ()
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Validate file
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Upload image to Cloudinary
    const result = await this.cloudinary.uploadImage(
      file,
      'user-images',
      userId,
    );

    // Save image record
    const image = await this.prisma.image.create({
      data: {
        filename: result.public_id,
        originalName: file.originalname,
        path: result.secure_url,
        mimetype: file.mimetype,
        size: file.size,
        uploadedById: adminId,
        userId: userId,
      },
    });

    this.logger.activity('IMAGE_UPLOADED_TO_USER', adminId, {
      targetUserId: userId,
      imageId: image.id,
    });

    return {
      message: 'Image uploaded successfully to user',
      image: {
        id: image.id,
        url: image.path,
        filename: image.filename,
        uploadedAt: image.createdAt,
      },
    };
  }

  // ============  (ADMIN): VIEW USER A's DATA ============
  async getUserDashboard(userId: string) {
    // Get the most recent company data submission
    const companyData = await this.prisma.companyData.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Get the most recent image (optional - for display)
    const recentImage = await this.prisma.image.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        memberSince: user.createdAt,
      },
      mostRecentSubmission: companyData
        ? {
            id: companyData.id,
            companyName: companyData.companyName,
            numberOfUsers: companyData.numberOfUsers,
            numberOfProducts: companyData.numberOfProducts,
            percentage: companyData.percentage,
            submittedAt: companyData.createdAt,
          }
        : null,
      recentImage: recentImage
        ? {
            id: recentImage.id,
            url: recentImage.path,
            filename: recentImage.filename,
            uploadedBy: recentImage.uploadedBy.fullName,
            uploadedAt: recentImage.createdAt,
          }
        : null,
      hasData: !!companyData,
      hasImage: !!recentImage,
    };
  }
}
