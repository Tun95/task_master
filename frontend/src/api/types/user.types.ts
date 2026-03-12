export interface CompanyData {
  id: string;
  companyName: string;
  numberOfUsers: number;
  numberOfProducts: number;
  percentage: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDataDto {
  companyName: string;
  numberOfUsers: number;
  numberOfProducts: number;
}

export interface Image {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimetype: string;
  size: number;
  uploadedBy: {
    id: string;
    fullName: string;
    email: string;
  };
  uploadedAt: string;
}

export interface UserDashboardResponse {
  user: {
    id: string;
    name: string;
    email: string;
    memberSince: string;
  };
  mostRecentSubmission: {
    id: string;
    companyName: string;
    numberOfUsers: number;
    numberOfProducts: number;
    percentage: number;
    submittedAt: string;
  } | null;
  recentImage: {
    id: string;
    url: string;
    filename: string;
    uploadedBy: string;
    uploadedAt: string;
  } | null;
  hasData: boolean;
  hasImage: boolean;
}

export interface UploadImageResponse {
  message: string;
  image: {
    id: string;
    url: string;
    filename: string;
    uploadedAt: string;
  };
}

// Existing types remain the same, adding new ones below

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN";
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithDetails extends User {
  companyData?: CompanyData[];
  receivedImages?: Image[];
}

export interface AdminWithDetails extends Admin {
  uploadedImages?: Image[];
}

export interface UserFilterDto {
  search?: string;
  role?: "USER" | "ADMIN";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface UsersResponseDto {
  data: Array<{
    id: string;
    email: string;
    fullName: string;
    role: "USER" | "ADMIN";
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

export interface UserStatsResponse {
  total: {
    users: number;
    admins: number;
    all: number;
  };
  active: {
    usersWithCompanyData: number;
  };
  recent: {
    users: Array<{
      id: string;
      email: string;
      fullName: string;
      createdAt: string;
    }>;
    admins: Array<{
      id: string;
      email: string;
      fullName: string;
      createdAt: string;
    }>;
  };
}

export interface UpdateProfileDto {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
}

export interface ProfileResponse extends User {
  companyData?: CompanyData[];
  receivedImages?: Image[];
}

export interface AdminProfileResponse extends Admin {
  uploadedImages?: Image[];
}

// Re-export existing types
export * from "./user.types";
