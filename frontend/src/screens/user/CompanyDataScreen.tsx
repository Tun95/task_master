"use client";

import { CompanyDataForm } from "@/components/forms/CompanyDataForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const CompanyDataScreen = () => {
  const { isAuthenticated, isUser, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (!isUser) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, isUser, router]);

  if (!isAuthenticated || !isUser) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Submit Company Data
          </h2>

          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-medium">Welcome, {user?.fullName}!</span>
              <br />
              Please fill in your company details below. The percentage will be
              automatically calculated based on your inputs.
            </p>
          </div>

          <CompanyDataForm
            onSuccess={() => {
              setTimeout(() => {
                router.push("/dashboard");
              }, 2000);
            }}
          />
        </div>
      </div>
    </div>
  );
};
