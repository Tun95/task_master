import axios, { AxiosError, AxiosInstance } from "axios";
import {
  CreateCompanyDataDto,
  CompanyData,
  UserDashboardResponse,
  UploadImageResponse,
  UsersResponseDto,
  UserFilterDto,
  UserStatsResponse,
  ProfileResponse,
  AdminProfileResponse,
  UpdateProfileDto,
  UserWithDetails,
  AdminWithDetails,
} from "../types/user.types";
import { authService } from "./authService";
import { ErrorResponse } from "../types/auth.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Helper to handle 401 unauthorized - redirect to login
const handleUnauthorized = () => {
  if (typeof window !== "undefined") {
    authService.clearAuth();
    window.location.href = "/login";
  }
};

class UserService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 50000,
    });

    // Add request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const userInfo = authService.getUserInfo();
        if (userInfo?.sessionId) {
          config.headers.Authorization = `Bearer ${userInfo.sessionId}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Add response interceptor for 401 handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          handleUnauthorized();
        }
        return Promise.reject(error);
      },
    );
  }

  private handleError(error: AxiosError<ErrorResponse>): never {
    console.error("API Error:", error);
    const response = error.response?.data;
    const status = error.response?.status;

    // Check for 401 in the error handler as well (in case interceptor doesn't catch it)
    if (status === 401) {
      handleUnauthorized();
    }

    const message =
      response?.message || error.message || "An unexpected error occurred";

    const apiError = {
      message,
      status,
    };

    throw apiError;
  }

  // ============ USER ENDPOINTS ============

  // User: Submit company data
  async createCompanyData(
    data: CreateCompanyDataDto,
  ): Promise<{ message: string; data: CompanyData }> {
    try {
      const response = await this.api.post("/api/users/company-data", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  // Get current user's profile
  async getProfile(): Promise<ProfileResponse | AdminProfileResponse> {
    try {
      const userInfo = authService.getUserInfo();
      if (!userInfo?.id) {
        throw new Error("No user logged in");
      }

      const endpoint = `/api/users/profile`;

      const response = await this.api.get(endpoint);

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  // Update current user's profile
  async updateProfile(
    data: UpdateProfileDto,
  ): Promise<ProfileResponse | AdminProfileResponse> {
    try {
      const userInfo = authService.getUserInfo();
      if (!userInfo?.id) {
        throw new Error("No user logged in");
      }

      const endpoint = `/api/users/profile`;

      const response = await this.api.patch(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  // ============ ADMIN ENDPOINTS ============

  // Admin: Get user stats
  async getUserStats(): Promise<UserStatsResponse> {
    try {
      const response = await this.api.get("/api/users/admin/users/stats");
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  // Admin: Get all users with filtering
  async getAllUsers(filter?: UserFilterDto): Promise<UsersResponseDto> {
    try {
      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await this.api.get("/api/users/admin/users", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  // Admin: Get user by ID
  async getUserById(
    userId: string,
  ): Promise<UserWithDetails | AdminWithDetails> {
    try {
      const response = await this.api.get(`/api/users/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  // Admin: Get any user's profile by ID
  async getAdminUserProfile(userId: string): Promise<ProfileResponse> {
    try {
      const response = await this.api.get(`/api/users/admin/profile/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  // Admin: Update any user's profile by ID
  async updateAdminUserProfile(
    userId: string,
    data: UpdateProfileDto,
  ): Promise<ProfileResponse> {
    try {
      const response = await this.api.patch(
        `/api/users/admin/profile/${userId}`,
        data,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  // Admin: Upload image to user
  async uploadImageToUser(
    userId: string,
    file: File,
  ): Promise<UploadImageResponse> {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await this.api.post(
        `/api/users/admin/upload-to-user/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  // Admin: Get user dashboard (most recent data)
  async getUserDashboard(userId: string): Promise<UserDashboardResponse> {
    try {
      const response = await this.api.get(
        `/api/users/admin/user-dashboard/${userId}`,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  // ============ UTILITY METHODS ============

  // Get current user's ID
  getCurrentUserId(): string | null {
    const userInfo = authService.getUserInfo();
    return userInfo?.id || null;
  }

  // Get current user's role
  getCurrentUserRole(): "USER" | "ADMIN" | null {
    const userInfo = authService.getUserInfo();
    return userInfo?.role || null;
  }

  // Check if current user is admin
  isAdmin(): boolean {
    return authService.isAdmin();
  }

  // Check if current user is regular user
  isUser(): boolean {
    return authService.isUser();
  }
}

export const userService = new UserService();
