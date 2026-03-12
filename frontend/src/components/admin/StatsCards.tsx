"use client";

import { StatsCardProps } from "@/api/types/dashboard.types";
import { UserStatsResponse } from "@/api/types/user.types";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  Activity,
  Image as ImageIcon,
} from "lucide-react";

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendLabel,
}: StatsCardProps) => {
  // Map background colors to corresponding text colors with higher contrast
  const getTextColor = (bgColor: string) => {
    const colorMap: Record<string, string> = {
      "bg-blue-500": "text-blue-600 dark:text-blue-400",
      "bg-purple-500": "text-purple-600 dark:text-purple-400",
      "bg-green-500": "text-green-600 dark:text-green-400",
      "bg-orange-500": "text-orange-600 dark:text-orange-400",
      "bg-red-500": "text-red-600 dark:text-red-400",
      "bg-yellow-500": "text-yellow-600 dark:text-yellow-400",
    };
    return colorMap[bgColor] || "text-gray-600 dark:text-gray-400";
  };

  // Map background colors to lighter background tints
  const getBgTint = (bgColor: string) => {
    const tintMap: Record<string, string> = {
      "bg-blue-500": "bg-blue-50 dark:bg-blue-950/30",
      "bg-purple-500": "bg-purple-50 dark:bg-purple-950/30",
      "bg-green-500": "bg-green-50 dark:bg-green-950/30",
      "bg-orange-500": "bg-orange-50 dark:bg-orange-950/30",
      "bg-red-500": "bg-red-50 dark:bg-red-950/30",
      "bg-yellow-500": "bg-yellow-50 dark:bg-yellow-950/30",
    };
    return tintMap[bgColor] || "bg-gray-50 dark:bg-gray-800";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value.toLocaleString()}
          </p>
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm ${trend > 0 ? "text-green-500" : "text-red-500"}`}
              >
                {Math.abs(trend)}% {trendLabel || "vs last month"}
              </span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${getBgTint(color)}`}>
          <Icon className={`h-8 w-8 ${getTextColor(color)}`} />
        </div>
      </div>
    </div>
  );
};

export const StatsCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
      </div>
      <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-2xl">
        <div className="h-8 w-8"></div>
      </div>
    </div>
  </div>
);

export const StatsCards = ({
  stats,
  totalImages,
  isLoading,
}: {
  stats: UserStatsResponse | null;
  totalImages: number;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  // Calculate trends (example - you'd get these from your API)
  const cards: StatsCardProps[] = [
    {
      title: "Total Users",
      value: stats.total.users,
      icon: Users,
      color: "bg-blue-500",
      trend: 12,
      trendLabel: "vs last month",
    },
    {
      title: "Total Admins",
      value: stats.total.admins,
      icon: Shield,
      color: "bg-purple-500",
      trend: 0,
    },
    {
      title: "Active Users",
      value: stats.active.usersWithCompanyData,
      icon: Activity,
      color: "bg-green-500",
      trend: 8,
    },
    {
      title: "Total Images",
      value: totalImages,
      icon: ImageIcon,
      color: "bg-orange-500",
      trend: 15,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
};
