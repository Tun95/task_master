// components/ui/ImageGallery.tsx
"use client";

import { useState, useEffect } from "react";
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
import { getImageUrl } from "@/utils/imageUtils";

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
  const [imageError, setImageError] = useState(false);

  const currentImage = images[currentIndex];

  const handlePrevious = () => {
    setIsLoading(true);
    setImageError(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setIsLoading(true);
    setImageError(false);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleDownload = async () => {
    try {
      const imageUrl = getImageUrl(currentImage);
      if (!imageUrl) {
        console.error("No valid image URL found");
        return;
      }

      const response = await fetch(imageUrl);
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

  const handleImageError = () => {
    console.error("Failed to load image:", currentImage);
    setImageError(true);
    setIsLoading(false);
  };

  if (!currentImage) return null;

  const imageUrl = getImageUrl(currentImage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"
        aria-label="Close gallery"
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
            className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
              showInfo
                ? "bg-blue-600 text-white"
                : "bg-black/50 hover:bg-black/70 text-white"
            }`}
            title="Image information"
            aria-label="Toggle image information"
          >
            <Info className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all duration-200 cursor-pointer"
            title={isZoomed ? "Zoom out" : "Zoom in"}
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? (
              <ZoomOut className="h-5 w-5" />
            ) : (
              <ZoomIn className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all duration-200 cursor-pointer"
            title="Download image"
            aria-label="Download image"
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
            className="absolute left-4 z-40 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 z-40 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      {/* Main image - Using img tag to avoid Next.js Image issues */}
      <div
        className={`relative flex items-center justify-center w-full h-full transition-all duration-300 ${
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        onClick={() => !imageError && setIsZoomed(!isZoomed)}
      >
        {isLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {imageError ? (
          <div className="text-white text-center">
            <p className="text-xl mb-2">Failed to load image</p>
            <p className="text-sm text-gray-400">URL: {imageUrl}</p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={currentImage.filename || "Gallery image"}
            className={`transition-all duration-300 ${
              isZoomed
                ? "max-w-none cursor-zoom-out scale-150"
                : "max-w-full max-h-[90vh] w-auto h-auto cursor-zoom-in"
            }`}
            style={{
              objectFit: isZoomed ? "contain" : "contain",
            }}
            onLoad={() => setIsLoading(false)}
            onError={handleImageError}
          />
        )}
      </div>

      {/* Image info sidebar */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          showInfo ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Image Information
            </h3>
            <button
              onClick={() => setShowInfo(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close information panel"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Image preview thumbnail */}
          <div className="mb-6 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={currentImage.filename || "Thumbnail"}
              className="w-full h-32 object-cover"
              onError={() => console.log("Thumbnail failed to load:", imageUrl)}
            />
          </div>

          {/* Image details - rest remains the same */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
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
              <User className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
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
              <HardDrive className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
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
                <FileText className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
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
                {images.map((image, index) => {
                  const thumbUrl = getImageUrl(image);
                  return (
                    <button
                      key={image.id}
                      onClick={() => {
                        setCurrentIndex(index);
                        setIsLoading(true);
                        setImageError(false);
                      }}
                      className={`relative rounded-lg overflow-hidden aspect-square transition-all duration-200 cursor-pointer ${
                        index === currentIndex
                          ? "ring-2 ring-blue-600 scale-105"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbUrl}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Thumbnail failed to load:", thumbUrl);
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </button>
                  );
                })}
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
