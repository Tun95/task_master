// components/ui/ImageGallery.tsx
"use client";

import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  Info,
  Calendar,
  User,
  HardDrive,
  FileText,
} from "lucide-react";
import { Image as ImageType } from "@/api/types/user.types";
import Image from "next/image";

interface ImageGalleryProps {
  images: ImageType[];
  onClose: () => void;
  initialIndex?: number;
}

export const ImageGallery = ({
  images,
  onClose,
  initialIndex = 0,
}: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentImage = images[currentIndex];

  const handlePrevious = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentImage.filename || "image.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (!currentImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Top bar with image count and actions */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white">
          <span className="text-lg font-semibold">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              showInfo
                ? "bg-blue-600 text-white"
                : "bg-black/50 hover:bg-black/70 text-white"
            }`}
            title="Image information"
          >
            <Info className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all duration-200"
            title={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? (
              <ZoomOut className="h-5 w-5" />
            ) : (
              <ZoomIn className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all duration-200"
            title="Download image"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 z-40 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 z-40 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      {/* Main image */}
      <div
        className={`relative flex items-center justify-center w-full h-full transition-all duration-300 ${
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        onClick={() => setIsZoomed(!isZoomed)}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <Image
          src={currentImage.url}
          alt={currentImage.filename || "Gallery image"}
          width={1200}
          height={800}
          className={`transition-all duration-300 ${
            isZoomed
              ? "max-w-none cursor-zoom-out scale-150"
              : "max-w-full max-h-[90vh] w-auto h-auto cursor-zoom-in"
          }`}
          style={{
            objectFit: isZoomed ? "contain" : "contain",
          }}
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Image info sidebar */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          showInfo ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Image Information
            </h3>
            <button
              onClick={() => setShowInfo(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Image preview thumbnail - FIXED: Using Image component, not ImageGallery */}
          <div className="mb-6 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={currentImage.url}
              alt={currentImage.filename || "Thumbnail"}
              width={384}
              height={128}
              className="w-full h-32 object-cover"
            />
          </div>

          {/* Image details */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Filename
                </p>
                <p className="text-gray-900 dark:text-white font-medium break-words">
                  {currentImage.filename || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <User className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Uploaded By
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {currentImage.uploadedBy?.fullName || "Unknown"}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {currentImage.uploadedBy?.email || ""}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload Date
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {formatDate(currentImage.uploadedAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <HardDrive className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  File Size
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {formatFileSize(currentImage.size)}
                </p>
              </div>
            </div>

            {currentImage.originalName && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <FileText className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Original Name
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium break-words">
                    {currentImage.originalName}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail navigation */}
          {images.length > 1 && (
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                More Images
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsLoading(true);
                    }}
                    className={`relative rounded-lg overflow-hidden aspect-square transition-all duration-200 ${
                      index === currentIndex
                        ? "ring-2 ring-blue-600 scale-105"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard navigation hint */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
        ← Previous | Next → | ESC to close
      </div>
    </div>
  );
};
