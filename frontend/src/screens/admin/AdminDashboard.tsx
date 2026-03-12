"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/api/services/userService";
import { UploadImageForm } from "@/components/forms/UploadImageForm";
import { UserDashboardResponse } from "@/api/types/user.types";
import { toast } from "sonner";
import Image from "next/image";
import { ApiError } from "@/api/types/auth.types";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userData, setUserData] = useState<UserDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<
    Array<{ id: string; fullName: string; email: string }>
  >([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch list of users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "/api/users/admin/all?role=USER&limit=100",
          {
            headers: {
              Authorization: `Bearer ${user?.sessionId}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setUserList(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    };

    if (user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [user]);

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
  };

  const handleUploadSuccess = () => {
    if (selectedUserId) {
      fetchUserDashboard(selectedUserId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Users
            </h2>

            {loadingUsers ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : userList.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No users found
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {userList.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      selectedUserId === u.id
                        ? "bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent"
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {u.fullName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {u.email}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="lg:col-span-2">
          {selectedUserId ? (
            <div className="space-y-6">
              {/* Upload Image Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Upload Image to User
                </h2>
                <UploadImageForm
                  userId={selectedUserId}
                  onSuccess={handleUploadSuccess}
                />
              </div>

              {/* User Dashboard Data */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  User&apos;s Latest Data
                </h2>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Loading...
                    </p>
                  </div>
                ) : userData ? (
                  <div className="space-y-6">
                    {/* User Info */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {userData.user.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {userData.user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Member since:{" "}
                        {new Date(
                          userData.user.memberSince,
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Company Data */}
                    {userData.mostRecentSubmission ? (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Most Recent Company Data
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Company
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {userData.mostRecentSubmission.companyName}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Users
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {userData.mostRecentSubmission.numberOfUsers}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Products
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {userData.mostRecentSubmission.numberOfProducts}
                            </p>
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                              Percentage
                            </p>
                            <p className="font-bold text-purple-700 dark:text-purple-300">
                              {userData.mostRecentSubmission.percentage}%
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Submitted:{" "}
                          {new Date(
                            userData.mostRecentSubmission.submittedAt,
                          ).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                        No company data submitted yet
                      </p>
                    )}

                    {/* Recent Image */}
                    {userData.recentImage && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Most Recent Image
                        </h4>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <Image
                            src={userData.recentImage.url}
                            alt="User upload"
                            className="max-h-48 rounded-lg mx-auto"
                          />
                          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            <p>
                              Uploaded by: {userData.recentImage.uploadedBy}
                            </p>
                            <p>
                              Uploaded:{" "}
                              {new Date(
                                userData.recentImage.uploadedAt,
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                    Select a user to view their data
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Select a user from the list to view their data and upload images
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
