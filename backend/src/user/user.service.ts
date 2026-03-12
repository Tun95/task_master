import { LoggerService } from '@/utils/common/logger/logger.service';
import { PrismaService } from '@/utils/prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateCompanyDataDto,
  UpdateCompanyDataDto,
} from './dto/company-data.dto';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { UserFilterDto } from './dto/user-filter.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cloudinary: CloudinaryService,
  ) {}

  // ============ ADMIN METHODS ============

  async findAll(filterDto: UserFilterDto) {
    const {
      search,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filterDto;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    // Get users and admins separately
    const [users, admins, totalUsers, totalAdmins] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          companyData: true,
          receivedImages: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      this.prisma.admin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.user.count({ where }),
      this.prisma.admin.count({ where }),
    ]);

    // Combine and sort with type safety
    const allUsers = [...users, ...admins].sort((a: any, b: any) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    return {
      data: allUsers.slice(0, limit),
      meta: {
        page,
        limit,
        total: totalUsers + totalAdmins,
        totalUsers,
        totalAdmins,
        pages: Math.ceil((totalUsers + totalAdmins) / limit),
      },
    };
  }

  async findById(id: string) {
    // Try to find in User first, then Admin
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        companyData: true,
        receivedImages: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (user) {
      return user;
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (admin) {
      return admin;
    }

    throw new NotFoundException('User not found');
  }

  async getUserStats() {
    const [
      totalUsers,
      totalAdmins,
      usersWithCompanyData,
      recentUsers,
      recentAdmins,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.admin.count(),
      this.prisma.user.count({
        where: { companyData: { isNot: null } },
      }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, fullName: true, createdAt: true },
      }),
      this.prisma.admin.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, fullName: true, createdAt: true },
      }),
    ]);

    return {
      total: {
        users: totalUsers,
        admins: totalAdmins,
        all: totalUsers + totalAdmins,
      },
      active: {
        usersWithCompanyData,
      },
      recent: {
        users: recentUsers,
        admins: recentAdmins,
      },
    };
  }

  // ============ USER PROFILE METHODS ============

  async getProfile(userId: string, userType: string) {
    if (userType === 'user') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          companyData: true,
          receivedImages: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } else {
      const admin = await this.prisma.admin.findUnique({
        where: { id: userId },
      });

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      return admin;
    }
  }

  async updateProfile(
    userId: string,
    userType: string,
    updateDto: UpdateProfileDto,
  ) {
    if (userType === 'user') {
      return this.prisma.user.update({
        where: { id: userId },
        data: updateDto,
      });
    } else {
      return this.prisma.admin.update({
        where: { id: userId },
        data: updateDto,
      });
    }
  }

  async uploadProfileImage(
    userId: string,
    userType: string,
    file: Express.Multer.File,
  ) {
    // Upload to Cloudinary
    const result = await this.cloudinary.uploadImage(file, 'profiles', userId);

    if (userType === 'user') {
      const image = await this.prisma.image.create({
        data: {
          filename: result.public_id,
          originalName: file.originalname,
          path: result.secure_url,
          mimetype: file.mimetype,
          size: file.size,
          uploadedById: userId, // This would need to be an admin ID in a real scenario
          userId: userId,
        },
      });

      return {
        message: 'Profile image uploaded successfully',
        image: {
          id: image.id,
          url: image.path,
          filename: image.filename,
        },
      };
    } else {
      return {
        message: 'Image uploaded successfully',
        url: result.secure_url,
        publicId: result.public_id,
      };
    }
  }

  async deleteProfileImage(userId: string, userType: string) {
    if (userType === 'user') {
      // Find images uploaded for this user
      const images = await this.prisma.image.findMany({
        where: { userId },
      });

      for (const image of images) {
        const publicId = image.filename;
        await this.cloudinary.deleteImage(publicId);
        await this.prisma.image.delete({
          where: { id: image.id },
        });
      }

      return { message: 'Profile images deleted successfully' };
    }

    return { message: 'Profile image deleted' };
  }

  // ============ USER A: COMPANY DATA METHODS ============

  // Create company
  async createCompanyData(userId: string, createDto: CreateCompanyDataDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if company data already exists
    const existing = await this.prisma.companyData.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException(
        'Company data already exists for this user. Use update instead.',
      );
    }

    // Calculate percentage
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
      message: 'Company data created successfully',
      data: companyData,
    };
  }

  // Get company
  async getCompanyData(userId: string) {
    const companyData = await this.prisma.companyData.findUnique({
      where: { userId },
    });

    if (!companyData) {
      throw new NotFoundException('Company data not found for this user');
    }

    return {
      message: 'Company data retrieved successfully',
      data: companyData,
    };
  }

  // Update company
  async updateCompanyData(userId: string, updateDto: UpdateCompanyDataDto) {
    const existing = await this.prisma.companyData.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new NotFoundException('Company data not found');
    }

    const updateData: any = { ...updateDto };

    if (updateDto.numberOfUsers || updateDto.numberOfProducts) {
      const users = updateDto.numberOfUsers ?? existing.numberOfUsers;
      const products = updateDto.numberOfProducts ?? existing.numberOfProducts;

      if (users > 0) {
        updateData.percentage = parseFloat(
          ((products / users) * 100).toFixed(2),
        );
      }
    }

    const companyData = await this.prisma.companyData.update({
      where: { userId },
      data: updateData,
    });

    this.logger.activity('COMPANY_DATA_UPDATED', userId, {
      updates: Object.keys(updateDto),
      newPercentage: companyData.percentage,
    });

    return {
      message: 'Company data updated successfully',
      data: companyData,
    };
  }

  // ============ IMAGE UPLOAD METHODS ============

  // Upload a single image
  async uploadImageToUser(
    adminId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    // Check if target user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Target user not found');
    }

    // Check if admin exists
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Upload single image to Cloudinary
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

  // Get all images for a specific User
  async getUserImages(userId: string) {
    const images = await this.prisma.image.findMany({
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

    return {
      message: 'User images retrieved successfully',
      count: images.length,
      images,
    };
  }

  // Get the most recent image for a specific User
  async getMostRecentImage(userId: string) {
    const image = await this.prisma.image.findFirst({
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

    if (!image) {
      return {
        message: 'No images found for this user',
        image: null,
      };
    }

    return {
      message: 'Most recent image retrieved',
      image,
    };
  }

  // Get combined data for a user (company data and recent image)
  async getUserDashboard(userId: string) {
    const [companyData, recentImage] = await Promise.all([
      this.prisma.companyData.findUnique({
        where: { userId },
      }),
      this.prisma.image.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      userId,
      companyData: companyData || null,
      recentImage: recentImage || null,
      hasCompanyData: !!companyData,
      hasImage: !!recentImage,
    };
  }
}
