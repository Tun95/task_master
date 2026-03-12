"use client";

import { useFormik } from "formik";
import { companyDataSchema } from "@/schemas";
import { userService } from "@/api/services/userService";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api/types/auth.types";
import { Loader2 } from "lucide-react";

interface CompanyDataFormProps {
  onSuccess?: () => void;
}

export const CompanyDataForm = ({ onSuccess }: CompanyDataFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedPercentage, setCalculatedPercentage] = useState<
    number | null
  >(null);

  const formik = useFormik({
    initialValues: {
      companyName: "",
      numberOfUsers: "",
      numberOfProducts: "",
    },
    validationSchema: companyDataSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await userService.createCompanyData({
          companyName: values.companyName,
          numberOfUsers: Number(values.numberOfUsers),
          numberOfProducts: Number(values.numberOfProducts),
        });

        toast.success(
          response.message || "Company data submitted successfully!",
        );
        setCalculatedPercentage(response.data.percentage);

        if (onSuccess) {
          onSuccess();
        }

        formik.resetForm();
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to submit company data");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Calculate percentage live as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);

    const users =
      e.target.name === "numberOfUsers"
        ? Number(e.target.value)
        : Number(formik.values.numberOfUsers);
    const products =
      e.target.name === "numberOfProducts"
        ? Number(e.target.value)
        : Number(formik.values.numberOfProducts);

    if (users > 0 && products > 0) {
      const percentage = (products / users) * 100;
      setCalculatedPercentage(parseFloat(percentage.toFixed(2)));
    } else {
      setCalculatedPercentage(null);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="companyName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Company Name
        </label>
        <div className="mt-1">
          <input
            id="companyName"
            name="companyName"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.companyName}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white sm:text-sm transition-colors duration-200"
            placeholder="Acme Inc."
          />
          {formik.touched.companyName && formik.errors.companyName && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {formik.errors.companyName}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="numberOfUsers"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Number of Users
        </label>
        <div className="mt-1">
          <input
            id="numberOfUsers"
            name="numberOfUsers"
            type="number"
            min="1"
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
            value={formik.values.numberOfUsers}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white sm:text-sm transition-colors duration-200"
            placeholder="50"
          />
          {formik.touched.numberOfUsers && formik.errors.numberOfUsers && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {formik.errors.numberOfUsers}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="numberOfProducts"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Number of Products
        </label>
        <div className="mt-1">
          <input
            id="numberOfProducts"
            name="numberOfProducts"
            type="number"
            min="1"
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
            value={formik.values.numberOfProducts}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white sm:text-sm transition-colors duration-200"
            placeholder="150"
          />
          {formik.touched.numberOfProducts &&
            formik.errors.numberOfProducts && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {formik.errors.numberOfProducts}
              </p>
            )}
        </div>
      </div>

      {calculatedPercentage !== null && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Calculated Percentage:</span>{" "}
            {calculatedPercentage}% ({(calculatedPercentage / 100).toFixed(2)}{" "}
            products per user)
          </p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting || !formik.isValid || !formik.dirty}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Submitting...
            </>
          ) : (
            "Submit Company Data"
          )}
        </button>
      </div>
    </form>
  );
};
