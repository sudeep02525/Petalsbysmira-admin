"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import Link from "next/link";
import { Search, Eye, Filter } from "lucide-react";
import dayjs from "dayjs";

export default function RequestsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["requests", page, status],
    queryFn: async () => {
      const res = await axiosInstance.get(`/requests?page=${page}&limit=20${status ? `&status=${status}` : ""}`);
      return res.data;
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "New": return <span className="inline-flex items-center px-2 py-1 rounded-sm border text-xs font-bold uppercase tracking-widest bg-black text-white border-black dark:bg-white dark:text-black dark:border-white">New</span>;
      case "Contacted": return <span className="inline-flex items-center px-2 py-1 rounded-sm border text-xs font-bold uppercase tracking-widest bg-gray-100 text-black border-gray-300 dark:bg-[#1a1a1a] dark:text-white dark:border-gray-700">Contacted</span>;
      case "Approved": return <span className="inline-flex items-center px-2 py-1 rounded-sm border text-xs font-bold uppercase tracking-widest bg-white text-black border-black dark:bg-black dark:text-white dark:border-white">Approved</span>;
      case "Declined": return <span className="inline-flex items-center px-2 py-1 rounded-sm border text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-500 border-gray-300 dark:bg-[#111] dark:text-gray-600 dark:border-gray-800 line-through">Declined</span>;
      default: return <span className="inline-flex items-center px-2 py-1 rounded-sm border text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-800 border-gray-300 dark:bg-[#111] dark:text-gray-400 dark:border-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold font-serif dark:text-white">Access Requests</h1>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] rounded-sm shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#0a0a0a]">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-sm bg-white dark:bg-[#0a0a0a] focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white dark:text-white transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 dark:border-gray-800 rounded-sm py-2 pl-3 pr-8 bg-white dark:bg-[#0a0a0a] dark:text-white focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white transition-all shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Approved">Approved</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-black dark:text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Req ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Requested Piece</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading requests...</td>
                </tr>
              ) : data?.requests?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No requests found.</td>
                </tr>
              ) : (
                data?.requests?.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      #{req._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {dayjs(req.createdAt).format("MMM DD, YYYY")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{req.fullName}</div>
                      <div className="text-xs">{req.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {req.productId ? req.productId.name : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/requests/${req._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-black dark:text-white bg-gray-100 dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-black/50">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {data.page} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#111] dark:text-white disabled:opacity-50"
              >
                Prev
              </button>
              <button 
                disabled={page === data.totalPages} 
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#111] dark:text-white disabled:opacity-50"
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
