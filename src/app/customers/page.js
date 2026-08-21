"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { format } from "date-fns";
import { Search, Mail, Phone, MapPin } from "lucide-react";

export default function CustomersPage() {
  const { data = {}, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/customers");
      return res.data;
    },
  });

  const customers = data.customers || [];

  if (isLoading) return <div className="p-8 dark:text-white">Loading customers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-serif dark:text-white">Customers</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search customers..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-[#D4AF37] focus:border-[#D4AF37] w-full sm:w-64 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Joined Date</th>
                <th className="p-4 font-semibold">Addresses</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="p-4 font-medium text-black dark:text-white">
                      {customer.name}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {customer.email}</span>
                        <span className="flex items-center gap-2"><Phone className="w-3 h-3" /> {customer.phone}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {format(new Date(customer.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {customer.addresses?.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{customer.addresses.length} saved</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">None saved</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          customer.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {customer.isActive ? "Active" : "Inactive"}
                      </span>
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
