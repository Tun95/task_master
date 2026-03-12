import { LoginScreen } from "@/screens/auth/LoginScreen";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | TaskMaster",
  description: "Sign in to your TaskMaster account",
};

export default function LoginPage() {
  return <LoginScreen />;
}
