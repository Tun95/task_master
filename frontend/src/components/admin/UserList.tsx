"use client";

import { UserListProps } from "@/api/types/dashboard.types";
import { Search, Loader2, Users, ChevronRight } from "lucide-react";
import { useState } from "react";

export const UserList = ({
  users,
  selectedUserId,
  onSelectUser,
  isLoading,
  totalUsers,
  isRefreshing,
}: UserListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Users ({totalUsers})
            </h2>
          </div>
          {isRefreshing && (
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "No users match your search" : "No users found"}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                selectedUserId === user.id
                  ? "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-500 shadow-lg"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {user.fullName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    {user.hasCompanyData && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        📊 Data
                      </span>
                    )}
                    {user.imageCount ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        🖼️ {user.imageCount}{" "}
                        {user.imageCount === 1 ? "image" : "images"}
                      </span>
                    ) : null}
                  </div>
                </div>
                <ChevronRight
                  className={`h-5 w-5 transition-colors ${
                    selectedUserId === user.id
                      ? "text-purple-500"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
