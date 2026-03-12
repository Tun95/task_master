"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CompanyData } from "@/api/types/user.types";
import Link from "next/link";

export const UserDashboard = () => {
  const { user } = useAuth();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/users/company-data/recent`, {
          headers: {
            Authorization: `Bearer ${user.sessionId}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCompanyData(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch company data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-6">
        {/* Welcome Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Welcome, {user?.fullName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Email: {user?.email}
          </p>
        </div>

        {/* Company Data Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Your Company Data
            </h3>
            <Link
              href="/company-data"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {companyData ? "Update Data" : "Add Data"}
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Loading...
              </p>
            </div>
          ) : companyData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Company Name
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {companyData.companyName}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Number of Users
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {companyData.numberOfUsers}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Number of Products
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {companyData.numberOfProducts}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Percentage
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {companyData.percentage}%
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {(companyData.percentage / 100).toFixed(2)} products per
                    user
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {new Date(companyData.updatedAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                You haven&apos;t submitted any company data yet.
              </p>
              <Link
                href="/company-data"
                className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Your First Data
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
