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

export interface LoginData {
  email: string;
  password: string;
  location_data?: {
    city?: string;
    region?: string;
    country?: string;
  };
}

export interface RegisterUserData {
  fullName: string;
  email: string;
  password: string;
  location_data?: {
    city?: string;
    region?: string;
    country?: string;
  };
}

export interface RegisterAdminData extends RegisterUserData {
  adminSecret: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface ResendOtpData {
  email: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  oobCode: string;
  newPassword: string;
}

export interface AuthResponse {
  message: string;
  user?: User;
  admin?: Admin;
  sessionId: string;
  accountType: "user" | "admin";
  hasCompanyData?: boolean;
}

export interface LoginResponse extends AuthResponse {}

export interface ErrorResponse {
  status: string;
  message: string;
  error?: string;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
