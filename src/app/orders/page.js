"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { format } from "date-fns";
import { Search, Eye } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/orders");
      return res.data.orders || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      await axiosInstance.put(`/admin/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    if (confirm(`Are you sure you want to mark this order as ${newStatus}?`)) {
      updateStatus.mutate({ id: orderId, status: newStatus });
    }
  };

  if (isLoading) return <div className="p-8">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-serif dark:text-white">Orders Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] rounded-lg text-sm focus:ring-[#D4AF37] focus:border-[#D4AF37] w-full sm:w-64 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Payment</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    <td className="p-4 font-medium text-black dark:text-white">#{order.orderNumber}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.shippingAddress?.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {order.guestEmail || order.user?.email || "Guest"}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 font-medium dark:text-white">
                      ₹{order.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {order.paymentMethod === "cod" ? "COD" : "Razorpay"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          order.orderStatus === "delivered"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : order.orderStatus === "shipped"
                            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
                            : order.orderStatus === "cancelled"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-3">
                      <select
                        className="text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded px-2 py-1 cursor-pointer focus:ring-[#D4AF37] focus:border-[#D4AF37] dark:text-white"
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updateStatus.isPending || order.orderStatus === "cancelled" || order.orderStatus === "delivered"}
                      >
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <Link href={`/orders/${order._id}`} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        <Eye className="w-5 h-5" />
                      </Link>
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
