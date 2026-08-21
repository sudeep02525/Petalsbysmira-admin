"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/categories");
      return res.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["adminProducts", page, searchTerm, categoryFilter, statusFilter],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.isActive = statusFilter;
      
      const res = await axiosInstance.get("/admin/products", { params });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/admin/products/${id}`),
    onSuccess: () => {
      toast.success("Product permanently deleted");
      queryClient.invalidateQueries(["adminProducts"]);
    },
    onError: (error) => {
      if (error.response?.data?.hasOrders) {
        toast.error(error.response.data.message, { duration: 5000 });
      } else {
        toast.error(error.response?.data?.message || "Failed to delete product");
      }
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => axiosInstance.put(`/admin/products/${id}`, { isActive }),
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? "Product activated" : "Product deactivated");
      queryClient.invalidateQueries(["adminProducts"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update product status");
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this product? If it has existing orders, this will fail. Deactivate the product instead if you want to hide it.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id, currentStatus) => {
    toggleActiveMutation.mutate({ id, isActive: !currentStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-serif dark:text-white">Products</h1>
        <Link
          href="/products/new"
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="bg-white dark:bg-[#111] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-sm focus:ring-[#D4AF37] focus:border-[#D4AF37] dark:text-white"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        
        <select
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-4 py-2 text-sm focus:ring-[#D4AF37] focus:border-[#D4AF37] w-full sm:w-48 dark:text-white"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        
        <select
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg px-4 py-2 text-sm focus:ring-[#D4AF37] focus:border-[#D4AF37] w-full sm:w-48 dark:text-white"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
                    Loading products...
                  </td>
                </tr>
              ) : data?.products?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 flex flex-col items-center">
                    <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
                    No products found.
                  </td>
                </tr>
              ) : (
                data?.products?.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{product.sku || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium dark:text-white">₹{product.discountPrice || product.price}</div>
                      {product.discountPrice && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 line-through">₹{product.price}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 0 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isActive ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(product._id, product.isActive)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title={product.isActive ? "Deactivate" : "Activate"}
                        >
                          {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link
                          href={`/products/${product._id}/edit`}
                          className="p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
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

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {data.page} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 dark:text-white"
              >
                Previous
              </button>
              <button
                disabled={page === data.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
