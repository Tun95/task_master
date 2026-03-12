"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/api/services/userService";
import {
  UserDashboardResponse,
  UsersResponseDto,
  UserStatsResponse,
} from "@/api/types/user.types";
import { toast } from "sonner";
import { ApiError } from "@/api/types/auth.types";
import { RefreshCw, LayoutDashboard } from "lucide-react";
import { StatsCards } from "@/components/admin/StatsCards";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { UserList } from "@/components/admin/UserList";
import { UserDetailsModal } from "@/components/admin/UserDetailsModal";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userList, setUserList] = useState<UsersResponseDto["data"]>([]);
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (user?.role !== "ADMIN") return;

    setIsRefreshing(true);
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        userService.getAllUsers({
          role: "USER",
          limit: 100,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
        userService.getUserStats(),
      ]);

      setUserList(usersResponse.data);
      setStats(statsResponse);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to refresh dashboard");
    } finally {
      setLoadingUsers(false);
      setLoadingStats(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchUserDashboard = async (userId: string) => {
    setIsLoading(true);
    try {
      const data = await userService.getUserDashboard(userId);
      setUserData(data);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    fetchUserDashboard(userId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    setUserData(null);
  };

  const handleUploadSuccess = () => {
    if (selectedUserId) {
      fetchUserDashboard(selectedUserId);
      fetchDashboardData(); // Refresh stats
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    if (selectedUserId && isModalOpen) {
      fetchUserDashboard(selectedUserId);
    }
  };

  const totalImages = userList.reduce((acc, u) => acc + (u.imageCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage users and monitor platform activity
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </div>

        {/* Stats Cards */}
        <StatsCards
          stats={stats}
          totalImages={totalImages}
          isLoading={loadingStats}
        />

        {/* Recent Activity */}
        {stats && !loadingStats && (
          <RecentActivity
            users={stats.recent.users}
            admins={stats.recent.admins}
          />
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-1">
            <UserList
              users={userList}
              selectedUserId={selectedUserId}
              onSelectUser={handleSelectUser}
              isLoading={loadingUsers}
              totalUsers={stats?.total.users || 0}
              isRefreshing={isRefreshing}
            />
          </div>

          {/* Quick Preview (TEST ONLY) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center h-full flex items-center justify-center">
              <div>
                <LayoutDashboard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a User
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Click on any user from the list to view their detailed
                  information, upload images, and manage their data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Details Modal */}
        <UserDetailsModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          userId={selectedUserId || ""}
          userData={userData}
          isLoading={isLoading}
          onRefresh={() => selectedUserId && fetchUserDashboard(selectedUserId)}
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
    </div>
  );
};
