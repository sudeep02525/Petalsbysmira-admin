"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../services/axiosInstance";
import { ArrowLeft, User, Phone, Mail, Clock, ShieldCheck, Box, Loader2, Save } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import toast from "react-hot-toast";

export default function RequestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [internalNotes, setInternalNotes] = useState("");
  const [status, setStatus] = useState("");

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/requests/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      setInternalNotes(data.internalNotes || "");
      setStatus(data.status);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      const res = await axiosInstance.put(`/requests/${id}`, updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["request", id]);
      toast.success("Request updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update request");
    }
  });

  const handleSave = () => {
    updateMutation.mutate({ status, internalNotes });
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading request details...</div>;
  }

  if (!request) {
    return <div className="p-8 text-center text-red-500">Request not found.</div>;
  }

  const getStatusColor = (s) => {
    switch (s) {
      case "New": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Contacted": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Approved": return "bg-green-100 text-green-800 border-green-200";
      case "Declined": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/requests" className="p-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222] transition">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-serif dark:text-white flex items-center gap-3">
              Request #{request._id.slice(-6).toUpperCase()}
              <span className={`text-xs px-2.5 py-1 rounded-md border ${getStatusColor(request.status)} font-sans font-medium`}>
                {request.status}
              </span>
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              Received {dayjs(request.createdAt).format("MMMM D, YYYY [at] h:mm A")}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50"
        >
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Customer & Request Info) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold font-serif border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" /> Client Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-gray-900 dark:text-white text-lg">{request.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Preferred Contact</p>
                <p className="font-medium text-gray-900 dark:text-white">{request.preferredContactMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</p>
                <a href={`mailto:${request.email}`} className="font-medium text-blue-600 hover:underline">{request.email}</a>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</p>
                <a href={`tel:${request.phone}`} className="font-medium text-blue-600 hover:underline">{request.phone}</a>
              </div>
            </div>

            {request.message && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 mb-2">Message from Client</p>
                <div className="p-4 bg-gray-50 dark:bg-black/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 italic border border-gray-100 dark:border-gray-800">
                  "{request.message}"
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold font-serif border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 dark:text-white flex items-center gap-2">
              <Box className="w-5 h-5 text-gray-400" /> Requested Piece
            </h2>
            
            {request.productId ? (
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-32 h-40 bg-gray-100 dark:bg-black rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 flex-shrink-0">
                  <img 
                    src={request.productId.images?.[0] || "https://images.unsplash.com/photo-1599643478514-4a820cbf311e?q=80"} 
                    alt={request.productId.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <Link href={`/products/${request.productId._id}`} className="text-lg font-serif font-bold text-gray-900 dark:text-white hover:text-[var(--color-gold)] transition-colors">
                    {request.productId.name}
                  </Link>
                  <p className="text-sm text-[var(--color-gold)] font-serif italic mb-4">{request.productId.shortSubtitle}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Internal Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">₹{request.productId.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Current Stock</p>
                      <p className="font-medium text-gray-900 dark:text-white">{request.productId.stock} Units</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">The requested product could not be found. It may have been deleted.</div>
            )}
          </div>
        </div>

        {/* Right Column (Management) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold font-serif border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gray-400" /> Manage Request
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Request Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 px-3 bg-white dark:bg-black dark:text-white focus:ring-black focus:border-black"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Approved">Approved</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Internal Notes</label>
                <textarea 
                  rows={6}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Notes for the team (not visible to client)..."
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 px-3 bg-white dark:bg-black dark:text-white focus:ring-black focus:border-black resize-none"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
