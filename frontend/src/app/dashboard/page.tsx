import { UserDashboard } from "@/screens/user/UserDashboard";
import { ProtectedRoute } from "@/utils/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | TaskMaster",
  description: "View your dashboard and recent activity",
};

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="USER">
      <UserDashboard />
    </ProtectedRoute>
  );
}
