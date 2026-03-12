import { AdminDashboard } from "@/screens/admin/AdminDashboard";
import { ProtectedRoute } from "@/utils/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | TaskMaster",
  description: "Manage users and monitor platform activity",
};

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
