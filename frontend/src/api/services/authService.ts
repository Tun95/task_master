import axios, { AxiosError, AxiosInstance } from "axios";
import {
  LoginData,
  RegisterUserData,
  RegisterAdminData,
  VerifyOtpData,
  ResendOtpData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse,
  ErrorResponse,
  LoginResponse,
  ApiError,
} from "../types/auth.types";
import { UserInfo } from "../types/context.types";
import { storeUserInfo, getUserInfo, clearUserInfo } from "@/utils/encryption";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://203.161.49.37:5005";

// Helper to handle 401 unauthorized - redirect to login
const handleUnauthorized = () => {
  if (typeof window !== "undefined") {
    clearUserInfo();
    window.location.href = "/login";
  }
};

class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 50000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        if (typeof window !== "undefined") {
          const userInfo = this.getUserInfo();
          if (userInfo?.sessionId) {
            config.headers.Authorization = `Bearer ${userInfo.sessionId}`;
          }
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

    // Handle validation errors array (from dto)
    if (
      response?.errors &&
      Array.isArray(response.errors) &&
      response.errors.length > 0
    ) {
      const errorMessages = response.errors.map((err) => err.msg).join(", ");
      const apiError: ApiError = {
        message: errorMessages || response.message || "Validation failed",
        status,
        errors: response.errors,
      };
      throw apiError;
    }

    // Handle network errors
    if (error.code === "ECONNREFUSED" || error.code === "NETWORK_ERROR") {
      const apiError: ApiError = {
        message: "Unable to connect to server. Please check your connection.",
        status: 503,
      };
      throw apiError;
    }

    // Use response message or fallback to error message
    const message =
      response?.message ||
      response?.error ||
      error.message ||
      "An unexpected error occurred";

    // Handle specific HTTP status codes
    if (status === 401) {
      const apiError: ApiError = {
        message: "Unauthorized access. Please login again.",
        status,
      };
      throw apiError;
    }

    if (status === 403) {
      const apiError: ApiError = {
        message: "Access forbidden. Insufficient permissions.",
        status,
      };
      throw apiError;
    }

    if (status === 404) {
      const apiError: ApiError = {
        message: "Resource not found.",
        status,
      };
      throw apiError;
    }

    if (status && status >= 500) {
      const apiError: ApiError = {
        message: "Server error. Please try again later.",
        status,
      };
      throw apiError;
    }

    const apiError: ApiError = {
      message,
      status,
    };

    throw apiError;
  }

  // Convert API response to UserInfo
  private convertToUserInfo(response: AuthResponse): UserInfo {
    return {
      id: response.user?.id || response.admin?.id || "",
      fullName: response.user?.fullName || response.admin?.fullName || "",
      email: response.user?.email || response.admin?.email || "",
      role: response.accountType === "admin" ? "ADMIN" : "USER",
      accountType: response.accountType,
      sessionId: response.sessionId,
      hasCompanyData: response.hasCompanyData,
    };
  }

  // Get decrypted user info from localStorage
  getUserInfo(): UserInfo | null {
    if (typeof window === "undefined") return null;
    return getUserInfo();
  }

  // Store encrypted user info
  private storeUserInfo(userInfo: UserInfo): void {
    storeUserInfo(userInfo);
  }

  // Clear auth data
  clearAuth(): void {
    clearUserInfo();
  }

  // Check authentication status
  isAuthenticated(): boolean {
    const userInfo = this.getUserInfo();
    return !!userInfo?.sessionId;
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getUserInfo();
    return user?.role === "ADMIN";
  }

  // Check if user is regular user
  isUser(): boolean {
    const user = this.getUserInfo();
    return user?.role === "USER";
  }

  // Get current user ID
  getUserId(): string | null {
    const userInfo = this.getUserInfo();
    return userInfo?.id || null;
  }

  // Check if session is expired
  isSessionExpired(): boolean {
    return false;
  }

  async login(loginData: LoginData): Promise<LoginResponse> {
    try {
      const response = await this.api.post<LoginResponse>(
        "/api/auth/login",
        loginData,
      );

      if (response.data) {
        const userInfo = this.convertToUserInfo(response.data);
        this.storeUserInfo(userInfo);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  async registerUser(
    data: RegisterUserData,
  ): Promise<{ message: string; userId: string; email: string }> {
    try {
      const response = await this.api.post("/api/auth/register/user", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  async registerAdmin(
    data: RegisterAdminData,
  ): Promise<{ message: string; adminId: string; email: string }> {
    try {
      const response = await this.api.post("/api/auth/register/admin", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  async logout(): Promise<void> {
    try {
      const userInfo = this.getUserInfo();
      if (userInfo?.sessionId) {
        await this.api.post(
          "/api/auth/logout",
          {},
          {
            headers: { Authorization: `Bearer ${userInfo.sessionId}` },
          },
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearAuth();
    }
  }

  async verifyOtp(
    data: VerifyOtpData,
  ): Promise<{ message: string; verified: boolean }> {
    try {
      const response = await this.api.post("/api/auth/verify-otp", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  async resendOtp(
    data: ResendOtpData,
  ): Promise<{ message: string; expiresIn: string }> {
    try {
      const response = await this.api.post("/api/auth/resend-otp", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  async forgotPassword(
    data: ForgotPasswordData,
  ): Promise<{ message: string; expiresIn: string }> {
    try {
      const response = await this.api.post("/api/auth/forgot-password", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response = await this.api.post("/api/auth/reset-password", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }
}

export const authService = new AuthService();
