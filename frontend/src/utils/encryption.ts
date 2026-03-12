import CryptoJS from "crypto-js";
import { UserInfo } from "@/api/types/context.types";

// Get encryption key from environment variables
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_SECRET_KEY ||
  "taskmaster-default-key";

// Type guard to check if decrypted data is valid UserInfo
export const isUserInfo = (data: unknown): data is UserInfo => {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "fullName" in data &&
    "email" in data &&
    "role" in data &&
    "accountType" in data &&
    "sessionId" in data
  );
};

// Encrypt any data
export const encryptData = (data: unknown): string => {
  try {
    const stringData = typeof data === "string" ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(stringData, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return "";
  }
};

// Decrypt data and validate as UserInfo
export const decryptData = (encryptedData: string): UserInfo | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      console.error("Decryption failed: empty result");
      return null;
    }

    const parsedData = JSON.parse(decrypted);

    // Validate that it has the structure of UserInfo
    if (isUserInfo(parsedData)) {
      return parsedData;
    }

    console.error("Decrypted data does not match UserInfo structure");
    return null;
  } catch (error) {
    console.error("Failed to decrypt data:", error);
    return null;
  }
};

// Store encrypted user info in localStorage
export const storeUserInfo = (userInfo: UserInfo): void => {
  try {
    const encrypted = encryptData(userInfo);
    localStorage.setItem("taskmaster_user", encrypted);
  } catch (error) {
    console.error("Failed to store user info:", error);
  }
};

// Get and decrypt user info from localStorage
export const getUserInfo = (): UserInfo | null => {
  try {
    const encrypted = localStorage.getItem("taskmaster_user");
    if (!encrypted) return null;
    return decryptData(encrypted);
  } catch (error) {
    console.error("Failed to get user info:", error);
    return null;
  }
};

// Clear user info from localStorage
export const clearUserInfo = (): void => {
  localStorage.removeItem("taskmaster_user");
};

// Alias for getUserInfo (for consistency with example)
export const getDecryptedUserInfo = getUserInfo;

// Get token expiration from JWT
export const getTokenExpiration = (token: string): number | null => {
  try {
    // Simple JWT decode without library (works for our format)
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    const decoded = JSON.parse(jsonPayload);
    return decoded.exp || null;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};
