import { LoggerService } from '@/utils/common/logger/logger.service';
import { PrismaService } from '@/utils/prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserFilterDto } from './dto/user-filter.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  CreateCompanyDataDto,
  UpdateCompanyDataDto,
} from './dto/company-data.dto';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

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

    if (!user) {
      const admin = await this.prisma.admin.findUnique({
        where: { id },
      });
      if (admin) {
        return admin;
      }
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
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
          uploadedById: userId,
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
      // For admins, they upload images to users
      // We'll just return the Cloudinary result
      return {
        message: 'Image uploaded successfully',
        url: result.secure_url,
        publicId: result.public_id,
      };
    }
  }

  async deleteProfileImage(userId: string, userType: string) {
    // Find and delete image from database
    if (userType === 'user') {
      // Find images uploaded for this user
      const images = await this.prisma.image.findMany({
        where: { userId },
      });

      for (const image of images) {
        // Extract public_id from path or filename
        const publicId = image.filename;
        await this.cloudinary.deleteImage(publicId);

        // Delete from database
        await this.prisma.image.delete({
          where: { id: image.id },
        });
      }

      return { message: 'Profile images deleted successfully' };
    }

    return { message: 'Profile image deleted' };
  }

  // ============ COMPANY DATA METHODS ============

  async createCompanyData(userId: string, createDto: CreateCompanyDataDto) {
    // Check if user exists and is a USER (not ADMIN)
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
        'Company data already exists for this user',
      );
    }

    // Calculate percentage (numberOfProducts / numberOfUsers * 100)
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

    return companyData;
  }

  async getCompanyData(userId: string) {
    const companyData = await this.prisma.companyData.findUnique({
      where: { userId },
    });

    if (!companyData) {
      throw new NotFoundException('Company data not found for this user');
    }

    return companyData;
  }

  async updateCompanyData(userId: string, updateDto: UpdateCompanyDataDto) {
    // Get existing data
    const existing = await this.prisma.companyData.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new NotFoundException('Company data not found');
    }

    // Prepare update data
    const updateData: any = { ...updateDto };

    // Recalculate percentage if users or products changed
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

    return companyData;
  }

  // ============ IMAGE UPLOAD METHODS ============

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

    // Upload to Cloudinary
    const result = await this.cloudinary.uploadImage(
      file,
      'user-images',
      userId,
    );

    // Save image record according to your schema
    const image = await this.prisma.image.create({
      data: {
        filename: result.public_id,
        originalName: file.originalname,
        path: result.secure_url,
        mimetype: file.mimetype,
        size: file.size,
        uploadedById: adminId, // This matches your schema (uploadedById references Admin)
        userId: userId, // This matches your schema (userId references User)
      },
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

    return images;
  }

  // Additional method to get image by ID
  async getImageById(imageId: string) {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }

  // Additional method to delete an image
  async deleteImage(adminId: string, imageId: string) {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    // Delete from Cloudinary
    await this.cloudinary.deleteImage(image.filename);

    // Delete from database
    await this.prisma.image.delete({
      where: { id: imageId },
    });

    return { message: 'Image deleted successfully' };
  }
}
