"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { userService } from "@/api/services/userService";
import { CompanyData, CreateCompanyDataDto } from "@/api/types/user.types";
import { toast } from "sonner";
import { ApiError } from "@/api/types/auth.types";
import {
  X,
  Building2,
  Users,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import companyDataSchema from "@/schemas/index";

interface CompanyDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingData?: CompanyData | null;
  onSuccess?: () => void;
}

export const CompanyDataModal = ({
  isOpen,
  onClose,
  existingData,
  onSuccess,
}: CompanyDataModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedPercentage, setCalculatedPercentage] = useState<
    number | null
  >(existingData?.percentage || null);

  const formik = useFormik<CreateCompanyDataDto>({
    initialValues: {
      companyName: existingData?.companyName || "",
      numberOfUsers: existingData?.numberOfUsers || 0,
      numberOfProducts: existingData?.numberOfProducts || 0,
    },
    companyDataSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await userService.createCompanyData(values);
        toast.success(
          response.message || "Company data submitted successfully!",
        );

        if (onSuccess) {
          onSuccess();
        }
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to submit company data");
      } finally {
        setIsSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  // Calculate percentage in real-time
  useEffect(() => {
    const { numberOfUsers, numberOfProducts } = formik.values;
    if (numberOfUsers > 0 && numberOfProducts > 0) {
      const percentage = (numberOfProducts / numberOfUsers) * 100;
      setCalculatedPercentage(parseFloat(percentage.toFixed(2)));
    } else {
      setCalculatedPercentage(null);
    }
  }, [formik.values.numberOfUsers, formik.values.numberOfProducts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {existingData ? "Update Company Data" : "Add Company Data"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Fill in your company details below
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                  Company Name
                </div>
              </label>
              <input
                type="text"
                name="companyName"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Enter company name"
              />
              {formik.touched.companyName && formik.errors.companyName && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formik.errors.companyName}
                </p>
              )}
            </div>

            {/* Number of Users */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  Number of Users
                </div>
              </label>
              <input
                type="number"
                name="numberOfUsers"
                value={formik.values.numberOfUsers || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Enter number of users"
              />
              {formik.touched.numberOfUsers && formik.errors.numberOfUsers && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formik.errors.numberOfUsers}
                </p>
              )}
            </div>

            {/* Number of Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-gray-500" />
                  Number of Products
                </div>
              </label>
              <input
                type="number"
                name="numberOfProducts"
                value={formik.values.numberOfProducts || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Enter number of products"
              />
              {formik.touched.numberOfProducts &&
                formik.errors.numberOfProducts && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formik.errors.numberOfProducts}
                  </p>
                )}
            </div>

            {/* Live Calculation Preview */}
            {calculatedPercentage !== null && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Calculated Percentage:
                  </span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {calculatedPercentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(calculatedPercentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {calculatedPercentage > 100
                    ? "More products than users"
                    : `${calculatedPercentage.toFixed(1)} products per 100 users`}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formik.isValid || !formik.dirty}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {existingData ? "Update" : "Submit"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
