import { AdminDashboard } from "@/screens/admin/AdminDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | TaskMaster",
  description: "Manage users and monitor platform activity",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}