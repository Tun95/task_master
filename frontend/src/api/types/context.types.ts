import { ReactNode } from "react";

export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  role: "USER" | "ADMIN";
  accountType: "user" | "admin";
  sessionId: string;
  hasCompanyData?: boolean;
}

export interface AuthState {
  user: UserInfo | null;
  isLoading: boolean;
  error: string | null;
}

export interface ThemeState {
  theme: "light" | "dark";
}

export interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
}

export interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export interface ContextProviderProps {
  children: ReactNode;
}
