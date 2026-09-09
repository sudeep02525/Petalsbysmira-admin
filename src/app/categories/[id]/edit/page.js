"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../../services/axiosInstance";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  description: yup.string().nullable(),
  displayOrder: yup.number().integer("Must be an integer").min(0).default(0),
  isActive: yup.boolean().default(true),
});

export default function EditCategory() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { data: category, isLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await axiosInstance.get(`/admin/categories/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || "",
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive !== undefined ? category.isActive : true,
      });
    }
  }, [category, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(`/admin/categories/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries(["adminCategories"]);
      queryClient.invalidateQueries(["categories"]);
      queryClient.invalidateQueries(["category", id]);
      router.push("/categories");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update category");
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/categories"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors dark:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold font-serif dark:text-white">Edit Category</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 space-y-6">
          <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-800 pb-2 text-gray-900 dark:text-white">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600"
                {...register("name")}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600"
                {...register("description")}
              ></textarea>
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600"
                {...register("displayOrder")}
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first (e.g. 0, 1, 2)</p>
            </div>
            
            <div className="flex items-center pt-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded w-4 h-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:ring-black dark:focus:ring-gray-600" {...register("isActive")} />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Active (Visible on website)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link
            href="/categories"
            className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-black dark:bg-white text-white dark:text-black px-8 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center min-w-[120px]"
          >
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
