"use client";

import { Header } from "./Header";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { isLoading } = useAuth();
  const pathname = usePathname();

  // Don't show layout patterns on login page
  const isLoginPage = pathname === "/login";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/*  */}
      {!isLoginPage && (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} TaskMaster. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};
