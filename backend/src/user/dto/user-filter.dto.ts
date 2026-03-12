import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class UserFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class UsersResponseDto {
  data: Array<{
    id: string;
    email: string;
    fullName: string;
    role: 'USER' | 'ADMIN';
    isEmailVerified: boolean;
    createdAt: string;
    hasCompanyData?: boolean;
    imageCount?: number;
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalUsers: number;
    totalAdmins: number;
    pages: number;
  };
}
