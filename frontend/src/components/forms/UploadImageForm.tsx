"use client";

import { useState, useRef } from "react";
import { userService } from "@/api/services/userService";
import { toast } from "sonner";
import Image from "next/image";
import { ApiError } from "@/api/types/auth.types";
import { Loader2, Upload, X } from "lucide-react";

interface UploadImageFormProps {
  userId: string;
  onSuccess?: () => void;
}

export const UploadImageForm = ({
  userId,
  onSuccess,
}: UploadImageFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (droppedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setFile(droppedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    setIsUploading(true);
    try {
      const response = await userService.uploadImageToUser(userId, file);
      toast.success(response.message || "Image uploaded successfully!");
      setFile(null);
      setPreview(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onClick={handleBoxClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors duration-200 cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-purple-500 transition-colors" />
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <span className="relative font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500 dark:text-purple-400 dark:hover:text-purple-300">
                Click to upload
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <Image
              src={preview}
              alt="Preview"
              width={400}
              height={300}
              className="max-h-64 w-auto mx-auto"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`
      flex-1 flex justify-center items-center py-2 px-4 
      border border-transparent rounded-md shadow-sm 
      text-sm font-medium text-white 
      bg-purple-600 dark:bg-purple-500
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
      transition-colors duration-200
      ${
        isUploading
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:bg-purple-700 dark:hover:bg-purple-600"
      }
    `}
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="-ml-1 mr-2 h-4 w-4" />
                  Upload Image
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isUploading}
              className={`
      flex-1 flex justify-center items-center py-2 px-4 
      border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
      text-sm font-medium text-gray-700 dark:text-gray-300 
      bg-white dark:bg-gray-900
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
      transition-colors duration-200
      ${
        isUploading
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
      }
    `}
            >
              <X className="-ml-1 mr-2 h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
