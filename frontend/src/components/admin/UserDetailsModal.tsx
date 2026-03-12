"use client";

import {
  X,
  RefreshCw,
  Calendar,
  Mail,
  User as UserIcon,
  Building2,
  Users,
  Package,
  Percent,
  Image as ImageIcon,
  Upload,
  Download,
} from "lucide-react";
import Image from "next/image";
import { UploadImageForm } from "@/components/forms/UploadImageForm";
import { useState, useRef, useEffect } from "react";
import { UserDetailsModalProps } from "@/api/types/dashboard.types";

// Define the tab type
type TabType = "overview" | "images" | "activity";

// Define tab item type
interface TabItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

export const UserDetailsModal = ({
  isOpen,
  onClose,
  userId,
  userData,
  isLoading,
  onRefresh,
  onUploadSuccess,
}: UserDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Define tabs with proper typing
  const tabs: TabItem[] = [
    { id: "overview", label: "Overview", icon: UserIcon },
    { id: "images", label: "Images", icon: ImageIcon },
    { id: "activity", label: "Activity", icon: Calendar },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Backdrop - lighter and with blur */}
      <div className="fixed inset-0 bg-black/10 backdrop-blur-sm transition-opacity" />

      {/* Modal Container */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* Modal Content */}
        <div
          ref={modalRef}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                User Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View and manage user information
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Refresh"
              >
                <RefreshCw
                  className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <nav className="flex space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600 dark:text-purple-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : !userData ? (
              <div className="text-center py-20">
                <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No data available for this user
                </p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* User Info Card */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {userData.user.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <p className="text-gray-600 dark:text-gray-400">
                              {userData.user.email}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Member since{" "}
                              {new Date(
                                userData.user.memberSince,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {userData.hasData && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
                              Has Data
                            </span>
                          )}
                          {userData.hasImage && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
                              Has Image
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Company Data */}
                    {userData.mostRecentSubmission ? (
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <Building2 className="h-5 w-5 mr-2 text-purple-500" />
                          Most Recent Company Data
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Building2 className="h-4 w-4 text-gray-500" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Company
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {userData.mostRecentSubmission.companyName}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Users
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {userData.mostRecentSubmission.numberOfUsers.toLocaleString()}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Products
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {userData.mostRecentSubmission.numberOfProducts.toLocaleString()}
                            </p>
                          </div>
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Percent className="h-4 w-4 text-purple-500" />
                              <p className="text-sm text-purple-600 dark:text-purple-400">
                                Percentage
                              </p>
                            </div>
                            <p className="font-bold text-2xl text-purple-700 dark:text-purple-300">
                              {userData.mostRecentSubmission.percentage}%
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                          Submitted on{" "}
                          {new Date(
                            userData.mostRecentSubmission.submittedAt,
                          ).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 text-center">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No company data submitted yet
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Images Tab */}
                {activeTab === "images" && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Upload className="h-5 w-5 mr-2 text-purple-500" />
                        Upload New Image
                      </h4>
                      <UploadImageForm
                        userId={userId}
                        onSuccess={onUploadSuccess}
                      />
                    </div>

                    {userData.recentImage && (
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <ImageIcon className="h-5 w-5 mr-2 text-purple-500" />
                          Recent Image
                        </h4>
                        <div className="relative group">
                          <Image
                            src={userData.recentImage.url}
                            alt="User upload"
                            width={600}
                            height={400}
                            className="rounded-xl mx-auto max-h-96 w-auto"
                            priority
                          />
                          {/* Transparent overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <a
                              href={userData.recentImage.url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors transform hover:scale-110 transition-transform"
                            >
                              <Download className="h-5 w-5 text-gray-700" />
                            </a>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                          <p>Uploaded by: {userData.recentImage.uploadedBy}</p>
                          <p>
                            Uploaded:{" "}
                            {new Date(
                              userData.recentImage.uploadedAt,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === "activity" && (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Recent Activity
                      </h4>
                      <div className="space-y-4">
                        {userData.mostRecentSubmission && (
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Building2 className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-gray-900 dark:text-white font-medium">
                                Submitted company data
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  userData.mostRecentSubmission.submittedAt,
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}
                        {userData.recentImage && (
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <ImageIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-gray-900 dark:text-white font-medium">
                                Image uploaded by{" "}
                                {userData.recentImage.uploadedBy}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  userData.recentImage.uploadedAt,
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
