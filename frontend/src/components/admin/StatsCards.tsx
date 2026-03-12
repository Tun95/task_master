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
}: StatsCardProps) => (
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
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
        <Icon className={`h-8 w-8 ${color.replace("bg-", "text-")}`} />
      </div>
    </div>
  </div>
);

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
