import { CompanyDataScreen } from "@/screens/user/CompanyDataScreen";
import { ProtectedRoute } from "@/utils/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Data | TaskMaster",
  description: "Submit your company information",
};

export default function CompanyDataPage() {
  return (
    <ProtectedRoute requiredRole="USER">
      <CompanyDataScreen />
    </ProtectedRoute>
  );
}
