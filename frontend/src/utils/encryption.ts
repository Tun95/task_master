import { UserInfo } from "@/api/types/context.types";

// Simple encryption for demo
export const encryptData = (data: UserInfo): string => {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
  } catch (error) {
    console.error("Encryption error:", error);
    return "";
  }
};

export const decryptData = (encryptedData: string): UserInfo | null => {
  try {
    const jsonString = atob(encryptedData);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

export const storeUserInfo = (userInfo: UserInfo): void => {
  const encrypted = encryptData(userInfo);
  localStorage.setItem("u_u", encrypted);
};

export const getUserInfo = (): UserInfo | null => {
  const encrypted = localStorage.getItem("u_u");
  if (!encrypted) return null;
  return decryptData(encrypted);
};

export const clearUserInfo = (): void => {
  localStorage.removeItem("u_u");
};
