"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../services/axiosInstance";
import { Package, Users, AlertTriangle, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/dashboard");
      return {
        totalRequests: res.data.totalRequests || 0,
        newRequests: res.data.newRequests || 0,
        totalProducts: res.data.totalProducts || 0,
        lowStockProducts: res.data.lowStockProducts || [],
      };
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex items-center">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg mr-4 animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const lowStockCount = stats?.lowStockProducts?.length || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-serif dark:text-white">Luxury Showcase Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#0a0a0a] rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-8 flex items-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white rounded-sm flex items-center justify-center mr-4 border border-gray-200 dark:border-gray-800">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Requests</p>
            <h3 className="text-2xl font-bold dark:text-white">{stats?.totalRequests || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-8 flex items-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white rounded-sm flex items-center justify-center mr-4 border border-gray-200 dark:border-gray-800">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">New Requests</p>
            <h3 className="text-2xl font-bold dark:text-white">{stats?.newRequests || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-8 flex items-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white rounded-sm flex items-center justify-center mr-4 border border-gray-200 dark:border-gray-800">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Active Editions</p>
            <h3 className="text-2xl font-bold dark:text-white">{stats?.totalProducts || 0}</h3>
          </div>
        </div>

        <div className={`bg-white dark:bg-[#0a0a0a] rounded-sm shadow-sm border p-8 flex items-center ${lowStockCount > 0 ? "border-amber-400/50 dark:border-amber-500/40" : "border-gray-200 dark:border-gray-800"}`}>
          <div className={`w-12 h-12 rounded-sm flex items-center justify-center mr-4 border ${lowStockCount > 0 ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900" : "bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white border-gray-200 dark:border-gray-800"}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Low Stock (≤ 5)</p>
            <h3 className={`text-2xl font-bold ${lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : "dark:text-white"}`}>
              {lowStockCount} {lowStockCount === 1 ? "Item" : "Items"}
            </h3>
          </div>
        </div>
      </div>

      {/* Low Stock Items Section */}
      {lowStockCount > 0 && (
        <div className="bg-white dark:bg-[#0a0a0a] rounded-sm shadow-sm border border-amber-200 dark:border-amber-900/50 p-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Low Stock Inventory Alerts
              </h2>
            </div>
            <Link href="/products" className="text-xs text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1">
              View All Products <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.lowStockProducts.map((p) => (
              <div key={p._id} className="p-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-sm flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{p.name}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{p.stock} units remaining</p>
                </div>
                <Link
                  href={`/products/${p._id}/edit`}
                  className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded-sm text-xs font-semibold hover:opacity-80 transition-opacity"
                >
                  Restock
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#0a0a0a] rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center mt-8">
        <h2 className="text-2xl font-serif mb-4 dark:text-white">Welcome to Petals by Smira Admin</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">Manage your luxury editions, client access requests, and inventory seamlessly.</p>
        <div className="flex justify-center gap-4">
          <Link href="/products/new" className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-sm font-bold uppercase tracking-widest text-[10px] hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md">
            + New Edition
          </Link>
          <Link href="/requests" className="px-8 py-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-sm font-bold uppercase tracking-widest text-[10px] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors shadow-sm">
            Review Access Requests
          </Link>
        </div>
      </div>
    </div>
  );
}
