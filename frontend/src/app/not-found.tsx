"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full text-center">
        {/* Animated 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <FileQuestion className="h-40 w-40 text-gray-400" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 group cursor-pointer"
          >
            <Home className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Return Home
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Here are some helpful links:
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              href="/dashboard"
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Profile
            </Link>
            <Link
              href="/settings"
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Settings
            </Link>
            <Link
              href="/help"
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
