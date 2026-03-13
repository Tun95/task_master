// components/UserDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/api/services/userService";
import {
  CompanyData,
  ProfileResponse,
  Image as ImageType,
} from "@/api/types/user.types";
import {
  Building2,
  Users,
  Package,
  User as UserIcon,
  Mail,
  Calendar,
  Plus,
  RefreshCw,
  Briefcase,
  Clock,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { CompanyDataModal } from "@/components/forms/CompanyDataForm";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { getImageUrl } from "@/utils/imageUtils";

export const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [images, setImages] = useState<ImageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);

  const fetchUserData = async () => {
    if (!user?.id) return;

    try {
      const profileData = (await userService.getProfile()) as ProfileResponse;
      setProfile(profileData);

      if (profileData.companyData && profileData.companyData.length > 0) {
        const sortedData = [...profileData.companyData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setCompanyData(sortedData[0]);
      } else {
        setCompanyData(null);
      }

      if (profileData.receivedImages) {
        setImages(profileData.receivedImages);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData();
    setIsRefreshing(false);
  };

  const handleSuccess = () => {
    fetchUserData();
    setIsModalOpen(false);
  };

  const daysSinceJoined = profile?.createdAt
    ? Math.floor(
        (new Date().getTime() - new Date(profile.createdAt).getTime()) /
          (1000 * 3600 * 24),
      )
    : 0;

  const productsPerUser = companyData
    ? (companyData.numberOfProducts / companyData.numberOfUsers).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-screen pb-10 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header with Gradient - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-white/20 rounded-2xl backdrop-blur-sm flex-shrink-0">
                <Briefcase className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div className="min-w-0">
                {" "}
                {/* Added min-w-0 to allow text truncation */}
                <h1 className="text-xl md:text-3xl font-bold text-white truncate">
                  Welcome back,{" "}
                  {profile?.fullName?.split(" ")[0] ||
                    user?.fullName?.split(" ")[0]}
                  !
                </h1>
                <p className="text-sm md:text-base text-blue-100 mt-1 truncate">
                  Track and manage your company metrics
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center px-3 py-2 md:px-4 md:py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all duration-200 disabled:opacity-50 cursor-pointer text-sm md:text-base w-full sm:w-auto"
            >
              <RefreshCw
                className={`h-3 w-3 md:h-4 md:w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-8">
        {/* User Profile Card - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-3 md:p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex-shrink-0">
                <UserIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {profile?.fullName || user?.fullName}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Mail className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                    <span className="text-xs md:text-sm truncate">
                      {profile?.email || user?.email}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                    <span className="text-xs md:text-sm">
                      {daysSinceJoined} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 cursor-pointer text-sm md:text-base w-full sm:w-auto"
            >
              <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
              Submit Data
            </button>
          </div>
        </div>

        {/* Stats Grid - Mobile Optimized */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 animate-pulse"
              >
                <div className="h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 md:w-24 mb-2 md:mb-3"></div>
                <div className="h-6 md:h-8 bg-gray-300 dark:bg-gray-600 rounded w-24 md:w-32"></div>
              </div>
            ))}
          </div>
        ) : companyData ? (
          <>
            {/* Company Data Stats - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <StatsCard
                title="Company"
                value={companyData.companyName}
                icon={Building2}
                color="bg-blue-500"
              />
              <StatsCard
                title="Users"
                value={companyData.numberOfUsers.toLocaleString()}
                icon={Users}
                color="bg-purple-500"
              />
              <StatsCard
                title="Products"
                value={companyData.numberOfProducts.toLocaleString()}
                icon={Package}
                color="bg-green-500"
              />
              <StatsCard
                title="Products/User"
                value={productsPerUser}
                icon={TrendingUp}
                color="bg-orange-500"
                suffix="x"
              />
            </div>

            {/* Detailed Metrics and Images Section - Mobile Optimized */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Percentage Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
                  <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg mr-2 md:mr-3">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  </div>
                  <span className="truncate">Product to User Ratio</span>
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="flex-1 w-full">
                    <div className="h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(companyData.percentage, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">
                      {companyData.percentage}%
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      of users have products
                    </p>
                  </div>
                </div>
              </div>

              {/* Images Summary Card */}
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 cursor-pointer hover:shadow-2xl transition-all duration-200"
                onClick={() => setShowImageGallery(true)}
              >
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
                  <div className="p-1.5 md:p-2 bg-green-100 rounded-lg mr-2 md:mr-3">
                    <ImageIcon className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  </div>
                  Your Images
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">
                      {images.length}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      total images
                    </p>
                  </div>
                  {images.length > 0 && (
                    <div className="flex -space-x-2 flex-shrink-0">
                      {images.slice(0, 3).map((image, index) => {
                        const imageUrl = getImageUrl(image);
                        return (
                          <div
                            key={image.id}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden bg-gray-200"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error(
                                  "Failed to load thumbnail:",
                                  imageUrl,
                                );
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        );
                      })}
                      {images.length > 3 && (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          +{images.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {images.length > 0 && (
                  <p className="mt-3 md:mt-4 text-xs md:text-sm text-blue-600 dark:text-blue-400">
                    Click to view all images →
                  </p>
                )}
              </div>
            </div>

            {/* Activity Timeline - Mobile Optimized */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 mb-6 md:mb-8">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
                <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg mr-2 md:mr-3">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
                Recent Activity
              </h3>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="p-1.5 md:p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <Building2 className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm md:text-base text-gray-900 dark:text-white font-medium">
                      Company data submitted
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      {new Date(companyData.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Updated Info - Mobile Optimized */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 md:p-4 text-xs md:text-sm text-blue-700 dark:text-blue-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="truncate">
                Last submitted:{" "}
                {new Date(companyData.createdAt).toLocaleString()}
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer whitespace-nowrap"
              >
                Submit new data →
              </button>
            </div>
          </>
        ) : (
          // Empty State - Mobile Optimized
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-12 text-center">
            <div className="inline-flex p-3 md:p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3 md:mb-4">
              <Building2 className="h-8 w-8 md:h-12 md:w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Company Data Yet
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6 max-w-md mx-auto px-4">
              Get started by submitting your company information. Track your
              users, products, and see valuable insights.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer text-sm md:text-base"
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Submit Your First Data
            </button>
          </div>
        )}
      </div>

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <ImageGallery
          images={images}
          onClose={() => setShowImageGallery(false)}
        />
      )}

      {/* Company Data Modal */}
      <CompanyDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingData={companyData}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
