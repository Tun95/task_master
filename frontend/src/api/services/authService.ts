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
  User,
  Admin,
  LoginResponse,
} from "../types/auth.types";
import { UserInfo } from "../types/context.types";
import { encryptData, storeUserInfo } from "@/utils/encryption";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
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
  }

  private handleError(error: AxiosError<ErrorResponse>): never {
    console.error("API Error:", error);

    const response = error.response?.data;
    const message =
      response?.message || error.message || "An unexpected error occurred";
    const status = error.response?.status;

    throw { message, status };
  }

  getUserInfo(): UserInfo | null {
    if (typeof window === "undefined") return null;
    const encrypted = localStorage.getItem("taskmaster_user");
    if (!encrypted) return null;
    try {
      return JSON.parse(atob(encrypted));
    } catch {
      return null;
    }
  }

  private storeUserInfo(userInfo: UserInfo): void {
    const encrypted = btoa(JSON.stringify(userInfo));
    localStorage.setItem("taskmaster_user", encrypted);
  }

  clearAuth(): void {
    localStorage.removeItem("taskmaster_user");
  }

  isAuthenticated(): boolean {
    return !!this.getUserInfo();
  }

  isAdmin(): boolean {
    const user = this.getUserInfo();
    return user?.role === "ADMIN";
  }

  isUser(): boolean {
    const user = this.getUserInfo();
    return user?.role === "USER";
  }

  async login(loginData: LoginData): Promise<LoginResponse> {
    try {
      const response = await this.api.post<LoginResponse>(
        "/api/auth/login",
        loginData,
      );

      if (response.data) {
        const userInfo: UserInfo = {
          id: response.data.user?.id || response.data.admin?.id || "",
          fullName:
            response.data.user?.fullName || response.data.admin?.fullName || "",
          email: response.data.user?.email || response.data.admin?.email || "",
          role: response.data.accountType === "admin" ? "ADMIN" : "USER",
          accountType: response.data.accountType,
          sessionId: response.data.sessionId,
          hasCompanyData: response.data.hasCompanyData,
        };
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
