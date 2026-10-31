"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../services/axiosInstance";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Box,
  Loader2,
  Save,
  KeyRound,
  Send,
  Ban,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import toast from "react-hot-toast";

export default function RequestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [internalNotesOverride, setInternalNotesOverride] = useState(null);
  const [statusOverride, setStatusOverride] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/requests/${id}`);
      return res.data;
    },
  });

  const internalNotes =
    internalNotesOverride !== null ? internalNotesOverride : request?.internalNotes || "";
  const status = statusOverride !== null ? statusOverride : request?.status || "New";

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
    },
  });

  const generateLinkMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/requests/${id}/generate-link`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["request", id]);
      if (data.accessUrl) {
        setGeneratedUrl(data.accessUrl);
      }
      if (data.emailSent === false) {
        toast.error("Link generated, but email delivery failed. Please copy link below to send manually.", { duration: 6000 });
      } else {
        toast.success(data.message || "Access link generated and sent!");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to generate link");
    },
  });

  const resendLinkMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/requests/${id}/resend`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["request", id]);
      if (data.accessUrl) {
        setGeneratedUrl(data.accessUrl);
      }
      if (data.emailSent === false) {
        toast.error("Link refreshed, but email delivery failed. Please copy link below to send manually.", { duration: 6000 });
      } else {
        toast.success("Naya link bhej diya. Purana link ab invalid ho gaya hai.", { duration: 5000 });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to resend access link");
    },
  });

  const revokeLinkMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/requests/${id}/revoke`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["request", id]);
      toast.success(data.message || "Private access revoked");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to revoke access");
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ status, internalNotes });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading request details...</div>;
  }

  if (!request) {
    return <div className="p-8 text-center text-red-500">Request not found.</div>;
  }

  const getStatusColor = (s) => {
    switch (s) {
      case "New":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Contacted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "In Discussion":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Access Granted":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isLinkExpired =
    request.privateAccessExpiresAt && new Date() > new Date(request.privateAccessExpiresAt);
  const isLinkRevoked = Boolean(request.privateAccessRevoked);
  const hasLink = Boolean(request.privateAccessToken);
  const currentAccessUrl = generatedUrl || request?.accessUrl || "";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/requests"
            className="p-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222] transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-serif dark:text-white flex items-center gap-3">
              Request #{request._id.slice(-6).toUpperCase()}
              <span
                className={`text-xs px-2.5 py-1 rounded-md border ${getStatusColor(
                  request.status
                )} font-sans font-medium`}
              >
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
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
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
                <p className="font-medium text-gray-900 dark:text-white text-lg">
                  {request.fullName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Preferred Contact</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {request.preferredContactMethod}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </p>
                <a
                  href={`mailto:${request.email}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {request.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </p>
                <a
                  href={`tel:${request.phone}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {request.phone}
                </a>
              </div>
            </div>

            {request.message && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 mb-2">Message from Client</p>
                <div className="p-4 bg-gray-50 dark:bg-black/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 italic border border-gray-100 dark:border-gray-800">
                  &ldquo;{request.message}&rdquo;
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
                    src={
                      request.productId.images?.[0] ||
                      "https://images.unsplash.com/photo-1599643478514-4a820cbf311e?q=80"
                    }
                    alt={request.productId.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <Link
                    href={`/products/${request.productId._id}/edit`}
                    className="text-lg font-serif font-bold text-gray-900 dark:text-white hover:text-[var(--color-gold)] transition-colors"
                  >
                    {request.productId.name}
                  </Link>
                  <p className="text-sm text-[var(--color-gold)] font-serif italic mb-4">
                    {request.productId.shortSubtitle}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Internal Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₹{request.productId.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Current Stock</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.productId.stock} Units
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                The requested product could not be found. It may have been deleted.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Management & Private Access) */}
        <div className="space-y-6">
          {/* Status & Notes */}
          <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold font-serif border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gray-400" /> Manage Request
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Request Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatusOverride(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 px-3 bg-white dark:bg-black dark:text-white focus:ring-black focus:border-black"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Discussion">In Discussion</option>
                  <option value="Access Granted">Access Granted</option>
                  <option value="Closed">Closed</option>
                  <option value="Rejected">Rejected</option>
                </select>
                {status === "Access Granted" && !request.privateAccessToken && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                    Status set hai, par link abhi generate nahi hua — neeche &ldquo;Generate &amp; Email Access Link&rdquo; dabao.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Internal Notes
                </label>
                <textarea
                  rows={5}
                  value={internalNotes}
                  onChange={(e) => setInternalNotesOverride(e.target.value)}
                  placeholder="Notes for the team (not visible to client)..."
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 px-3 bg-white dark:bg-black dark:text-white focus:ring-black focus:border-black resize-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Private Access Dispatch Actions */}
          <div className="bg-white dark:bg-[#111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold font-serif border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[var(--color-gold)]" /> Private Access
              </span>
              {hasLink && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    isLinkRevoked
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : isLinkExpired
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  }`}
                >
                  {isLinkRevoked ? "Revoked" : isLinkExpired ? "Expired" : "Active (24h)"}
                </span>
              )}
            </h2>

            <div className="space-y-4">
              {hasLink ? (
                <>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 bg-gray-50 dark:bg-black/40 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="flex justify-between">
                      <span>Token Expiry:</span>
                      <strong className="text-gray-800 dark:text-gray-200">
                        {request.privateAccessExpiresAt
                          ? dayjs(request.privateAccessExpiresAt).format("MMM D, YYYY h:mm A")
                          : "Not set"}
                      </strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Revoked Status:</span>
                      <strong className={isLinkRevoked ? "text-red-500" : "text-emerald-500"}>
                        {isLinkRevoked ? "Yes" : "No"}
                      </strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Client Opened Link:</span>
                      <strong className={request.privateAccessUsedAt ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                        {request.privateAccessUsedAt
                          ? dayjs(request.privateAccessUsedAt).format("MMM D, YYYY h:mm A")
                          : "Not yet opened"}
                      </strong>
                    </p>
                  </div>

                  {currentAccessUrl ? (
                    <div className="space-y-2 bg-gray-50 dark:bg-black/40 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">Active Access Link:</span>
                        <a
                          href={currentAccessUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--color-gold)] hover:underline inline-flex items-center gap-1 text-xs"
                        >
                          Open Link <ExternalLink className="w-3 h-3" />
                        </a>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={currentAccessUrl}
                          className="w-full text-xs font-mono bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-2 text-gray-700 dark:text-gray-300 select-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopy(currentAccessUrl)}
                          className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center justify-center flex-shrink-0"
                          title="Copy Link"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          )}
                        </button>
                      </div>

                      {request.phone && (
                        <a
                          href={`https://wa.me/${request.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hello ${request.fullName},\n\nHere is your private access link to view exclusive luxury pricing at Petals by Smira:\n${currentAccessUrl}\n\n(Valid for 24 hours)`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5" /> Share on WhatsApp
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
                      Link generated hai par URL database me saved nahi hai. Naya copyable link aur WhatsApp button ke liye &ldquo;Resend Access Email&rdquo; dabayein.
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Naya link generate hoga aur purana email wala link invalid ho jayega. Kya aap continue karna chahte hain?")) {
                          resendLinkMutation.mutate();
                        }
                      }}
                      disabled={resendLinkMutation.isPending}
                      className="w-full py-2.5 px-4 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {resendLinkMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Resend Access Email
                    </button>

                    {!isLinkRevoked && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Are you sure you want to revoke private access for this client?")) {
                            revokeLinkMutation.mutate();
                          }
                        }}
                        disabled={revokeLinkMutation.isPending}
                        className="w-full py-2 px-4 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {revokeLinkMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Ban className="w-3.5 h-3.5" />
                        )}
                        Revoke Access
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Customer has submitted interest. Approving will generate a 24-hour secure private
                    access link and automatically email it to <strong>{request.email}</strong>.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Generate 24-hour private access link and email it to ${request.email}?`)) {
                        generateLinkMutation.mutate();
                      }
                    }}
                    disabled={generateLinkMutation.isPending}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#b58c49] to-[#d4af37] text-black font-semibold rounded-lg text-sm hover:brightness-105 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generateLinkMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                    Generate & Email Access Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
