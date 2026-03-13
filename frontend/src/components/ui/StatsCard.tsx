"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: number;
  suffix?: string;
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  suffix,
}: StatsCardProps) => {
  const textColor = color.replace("bg-", "text-");
  const bgTint = color.replace("bg-", "bg-") + "/10";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
            {suffix && (
              <span className="text-lg ml-1 text-gray-500">{suffix}</span>
            )}
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
                {Math.abs(trend)}% vs last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${bgTint}`}>
          <Icon className={`h-8 w-8 ${textColor}`} />
        </div>
      </div>
    </div>
  );
};
