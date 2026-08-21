"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Megaphone, Loader2, Edit, Trash2 } from "lucide-react";
import axiosInstance from "../../services/axiosInstance";
import toast from "react-hot-toast";

export default function CampaignsPage() {
  const [isDeleting, setIsDeleting] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/campaigns");
      return data.campaigns || [];
    },
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(id);
    try {
      await axiosInstance.delete(`/admin/campaigns/${id}`);
      toast.success("Campaign deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete campaign");
    } finally {
      setIsDeleting(null);
    }
  };

  const getCampaignStatusInfo = (campaign) => {
    if (campaign.status === "draft" || !campaign.isActive) {
      return { label: "DISABLED", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    }
    
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    
    if (now > endDate) {
      return { label: "EXPIRED", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" };
    } else if (now >= startDate && now <= endDate) {
      return { label: "ACTIVE", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" };
    } else {
      return { label: "UPCOMING", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif flex items-center gap-2 dark:text-white">
            <Megaphone className="w-6 h-6 text-gray-400" />
            Campaigns
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage promotional banners and festival sections</p>
        </div>
        <Link
          href="/campaigns/new"
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </Link>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">Loading campaigns...</td>
                </tr>
              ) : !data || data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No campaigns found.</td>
                </tr>
              ) : (
                data.map((campaign) => {
                  const statusInfo = getCampaignStatusInfo(campaign);
                  return (
                    <tr key={campaign._id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{campaign.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{campaign.images?.length || 0} image(s)</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          <span className="font-medium text-gray-400 dark:text-gray-500">Start:</span> {new Date(campaign.startDate).toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          <span className="font-medium text-gray-400 dark:text-gray-500">End:</span> {new Date(campaign.endDate).toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{campaign.priority}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/campaigns/${campaign._id}/edit`}
                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(campaign._id)}
                            disabled={isDeleting === campaign._id}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isDeleting === campaign._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
