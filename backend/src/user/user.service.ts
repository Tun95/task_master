import { Request, Response } from 'express';
import { LoggerService } from '@/utils/common/logger/logger.service';
import { PrismaService } from '@/utils/prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCompanyDataDto } from './dto/company-data.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { UserFilterDto } from './dto/user-filter.dto';
import { User, Admin, CompanyData, Image } from '@prisma/client';

// TYPES
type UserWithRelations = User & {
  companyData: CompanyData[];
  receivedImages: (Image & {
    uploadedBy: Pick<Admin, 'id' | 'fullName' | 'email'>;
  })[];
};

type AdminWithRelations = Admin & {
  uploadedImages: (Image & {
    user: Pick<User, 'id' | 'fullName' | 'email'>;
  })[];
};

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

  async getAllUsers(filterDto: UserFilterDto) {
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

  async getUserById(id: string) {
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
        where: {
          companyData: {
            some: {},
          },
        },
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
      // First get the user without the complex include
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Then fetch the relations separately
      const [companyData, receivedImages] = await Promise.all([
        this.prisma.companyData.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 1,
        }),
        this.prisma.image.findMany({
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
        }),
      ]);

      // Combine the data
      const userWithRelations: UserWithRelations = {
        ...user,
        companyData,
        receivedImages,
      };

      // Create response with image count
      const response = {
        ...userWithRelations,
        imageCount: receivedImages.length,
      };

      return response;
    } else {
      // First get the admin without the complex include
      const admin = await this.prisma.admin.findUnique({
        where: { id: userId },
      });

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      // Then fetch the relations separately
      const uploadedImages = await this.prisma.image.findMany({
        where: { uploadedById: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      // Combine the data
      const adminWithRelations: AdminWithRelations = {
        ...admin,
        uploadedImages,
      };

      // Create response with image count
      const response = {
        ...adminWithRelations,
        imageCount: uploadedImages.length,
      };

      return response;
    }
  }

  async updateProfile(
    userId: string,
    userType: string,
    updateDto: UpdateProfileDto,
  ) {
    // Check if user exists based on type
    if (userType === 'user') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if email is being updated and if it's already taken
      if (updateDto.email && updateDto.email !== user.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: updateDto.email },
        });

        if (existingUser) {
          throw new BadRequestException('Email already in use');
        }

        const existingAdmin = await this.prisma.admin.findUnique({
          where: { email: updateDto.email },
        });

        if (existingAdmin) {
          throw new BadRequestException('Email already in use');
        }
      }

      // Update user
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateDto,
      });

      // Then fetch the relations separately
      const [companyData, receivedImages] = await Promise.all([
        this.prisma.companyData.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 1,
        }),
        this.prisma.image.findMany({
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
        }),
      ]);

      // Combine the data
      const userWithRelations: UserWithRelations = {
        ...updatedUser,
        companyData,
        receivedImages,
      };

      this.logger.activity('PROFILE_UPDATED', userId, {
        updates: Object.keys(updateDto),
      });

      // Add image count to the response
      const response = {
        ...userWithRelations,
        imageCount: receivedImages.length,
      };

      return response;
    } else {
      const admin = await this.prisma.admin.findUnique({
        where: { id: userId },
      });

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      // Check if email is being updated and if it's already taken
      if (updateDto.email && updateDto.email !== admin.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: updateDto.email },
        });

        if (existingUser) {
          throw new BadRequestException('Email already in use');
        }

        const existingAdmin = await this.prisma.admin.findUnique({
          where: { email: updateDto.email },
        });

        if (existingAdmin) {
          throw new BadRequestException('Email already in use');
        }
      }

      // Update admin
      const updatedAdmin = await this.prisma.admin.update({
        where: { id: userId },
        data: updateDto,
      });

      // Then fetch the relations separately
      const uploadedImages = await this.prisma.image.findMany({
        where: { uploadedById: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      // Combine the data
      const adminWithRelations: AdminWithRelations = {
        ...updatedAdmin,
        uploadedImages,
      };

      this.logger.activity('ADMIN_PROFILE_UPDATED', userId, {
        updates: Object.keys(updateDto),
      });

      // Add image count to the response
      const response = {
        ...adminWithRelations,
        imageCount: uploadedImages.length,
      };

      return response;
    }
  }

  // ============ (ADMIN): IMAGE UPLOAD METHODS ============
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

  // ============ (ADMIN): VIEW USER DATA ============
  async getUserDashboard(userId: string) {
    // Get the most recent company data submission
    const companyData = await this.prisma.companyData.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Get the most recent image
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
