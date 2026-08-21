"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../services/axiosInstance";
import { Package, ShoppingCart, IndianRupee, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/dashboard");
      return {
        totalOrders: res.data.totalOrders || 0,
        totalProducts: res.data.totalProducts || 0,
        revenue: res.data.totalRevenue || 0,
      };
    },
    retry: 1,
  });

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-serif dark:text-white">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex items-center">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mr-4">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Orders</p>
            <h3 className="text-2xl font-bold dark:text-white">{stats?.totalOrders || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex items-center">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mr-4">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold dark:text-white">₹{(stats?.revenue || 0).toLocaleString("en-IN")}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex items-center">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mr-4">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Products</p>
            <h3 className="text-2xl font-bold dark:text-white">{stats?.totalProducts || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex items-center">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center mr-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Conversion Rate</p>
            <h3 className="text-2xl font-bold dark:text-white">--%</h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center mt-8">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Welcome to Petals by Smira Admin</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Manage your luxury gifting products and orders.</p>
        <div className="flex justify-center gap-4">
          <Link href="/products/new" className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition">
            + Add New Product
          </Link>
          <Link href="/orders" className="px-6 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-gray-700 text-black dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#333] transition">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
