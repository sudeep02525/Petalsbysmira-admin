"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff, AlertCircle, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/categories");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries(["adminCategories"]);
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => axiosInstance.put(`/admin/categories/${id}`, { isActive }),
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? "Category activated" : "Category deactivated");
      queryClient.invalidateQueries(["adminCategories"]);
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id, currentStatus) => {
    toggleActiveMutation.mutate({ id, isActive: !currentStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-serif dark:text-white">Categories</h1>
        <Link
          href="/categories/new"
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Display Order</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12">
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : categories?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-3" strokeWidth={1.5} />
                      <p className="text-sm font-medium">No categories found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories?.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{cat.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{cat.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{cat.displayOrder || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-sm border text-xs font-bold uppercase tracking-widest ${cat.isActive ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white" : "bg-white text-gray-400 border-gray-300 dark:bg-black dark:text-gray-600 dark:border-gray-800"}`}>
                        {cat.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(cat._id, cat.isActive)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title={cat.isActive ? "Deactivate" : "Activate"}
                        >
                          {cat.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link
                          href={`/categories/${cat._id}/edit`}
                          className="p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
