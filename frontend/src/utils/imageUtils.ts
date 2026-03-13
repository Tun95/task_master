// utils/imageUtils.ts

import { Image } from "@/api/types/user.types";

// Define a type that includes the optional path
type ImageWithPossiblePath = Image & {
  path?: string;
};

export const getImageUrl = (image: Image): string => {
  // Cast to the extended type
  const img = image as ImageWithPossiblePath;

  // If url exists, use it
  if (img.url) {
    return img.url;
  }

  // If path exists (from backend), use it
  if (img.path) {
    return img.path;
  }

  // Fallback if neither exists
  console.warn("Image has no url or path property:", image);
  return "";
};

// Type guard using the extended type
export const hasPath = (image: Image): image is Image & { path: string } => {
  return (image as ImageWithPossiblePath).path !== undefined;
};
