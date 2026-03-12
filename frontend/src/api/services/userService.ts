import axios, { AxiosError, AxiosInstance } from "axios";
import {
  CreateCompanyDataDto,
  CompanyData,
  UserDashboardResponse,
  UploadImageResponse,
} from "../types/user.types";
import { authService } from "./authService";
import { ErrorResponse } from "../types/auth.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  }

  private handleError(error: AxiosError<ErrorResponse>): never {
    console.error("API Error:", error);
    const response = error.response?.data;
    const message =
      response?.message || error.message || "An unexpected error occurred";
    throw { message };
  }

  // User A: Submit company data
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

  // Get current user's ID
  getCurrentUserId(): string | null {
    const userInfo = authService.getUserInfo();
    return userInfo?.id || null;
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
