"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../services/axiosInstance";
import { format } from "date-fns";
import { ArrowLeft, Package, Truck, FileText, Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function OrderDetailPage({ params }) {
  const { id } = params;
  const queryClient = useQueryClient();
  const [courierId, setCourierId] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/orders/${id}`);
      return res.data;
    },
  });

  const syncShiprocket = useMutation({
    mutationFn: async () => await axiosInstance.post(`/admin/orders/${id}/shiprocket/sync`),
    onSuccess: () => queryClient.invalidateQueries(["admin-order", id]),
  });

  const assignAwb = useMutation({
    mutationFn: async () => await axiosInstance.post(`/admin/orders/${id}/shiprocket/awb`, { courierId }),
    onSuccess: () => queryClient.invalidateQueries(["admin-order", id]),
  });

  const requestPickup = useMutation({
    mutationFn: async () => await axiosInstance.post(`/admin/orders/${id}/shiprocket/pickup`),
    onSuccess: () => queryClient.invalidateQueries(["admin-order", id]),
  });

  const generateLabel = useMutation({
    mutationFn: async () => await axiosInstance.post(`/admin/orders/${id}/shiprocket/label`),
    onSuccess: () => queryClient.invalidateQueries(["admin-order", id]),
  });

  const generateManifest = useMutation({
    mutationFn: async () => await axiosInstance.post(`/admin/orders/${id}/shiprocket/manifest`),
    onSuccess: () => queryClient.invalidateQueries(["admin-order", id]),
  });

  if (isLoading) return <div className="p-8">Loading order details...</div>;
  if (!order) return <div className="p-8">Order not found.</div>;

  const status = order.shiprocketSyncStatus || "not_created";
  const shipping = order.shipping || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders" className="text-gray-500 hover:text-black transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold font-serif">Order #{order.orderNumber}</h1>
        <span className="px-3 py-1 bg-black text-[#D4AF37] rounded-full text-xs font-bold uppercase tracking-wider">
          {order.orderStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Customer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Customer Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Name</p>
                <p className="font-medium">{order.shippingAddress?.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Email</p>
                <p className="font-medium">{order.guestEmail || order.user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Phone</p>
                <p className="font-medium">{order.shippingAddress?.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Address</p>
                <p className="font-medium">
                  {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Shiprocket Fulfillment */}
        <div className="space-y-6">
          <div className="bg-black text-white p-6 rounded-xl shadow-sm border border-[#D4AF37]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Truck className="w-24 h-24 text-[#D4AF37]" />
            </div>
            
            <h2 className="text-lg font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Shiprocket Fulfillment
            </h2>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between text-sm border-b border-gray-800 pb-2">
                <span className="text-gray-400">Sync Status:</span>
                <span className="font-bold uppercase tracking-wider text-[#D4AF37]">{status.replace("_", " ")}</span>
              </div>

              {shipping.shipmentId && (
                <div className="flex justify-between text-sm border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Shipment ID:</span>
                  <span className="font-medium">{shipping.shipmentId}</span>
                </div>
              )}

              {shipping.awbCode && (
                <div className="flex justify-between text-sm border-b border-gray-800 pb-2">
                  <span className="text-gray-400">AWB Code:</span>
                  <span className="font-medium">{shipping.awbCode}</span>
                </div>
              )}

              {/* Action Buttons based on status */}
              <div className="pt-4">
                {status === "not_created" && (
                  <button
                    onClick={() => syncShiprocket.mutate()}
                    disabled={syncShiprocket.isPending}
                    className="w-full bg-[#D4AF37] hover:bg-white text-black font-bold py-3 rounded-md transition-colors"
                  >
                    {syncShiprocket.isPending ? "Syncing..." : "Create Shiprocket Order"}
                  </button>
                )}

                {status === "created" && (
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Courier ID (Leave blank for auto)" 
                      value={courierId}
                      onChange={(e) => setCourierId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      onClick={() => assignAwb.mutate()}
                      disabled={assignAwb.isPending}
                      className="w-full bg-[#D4AF37] hover:bg-white text-black font-bold py-3 rounded-md transition-colors"
                    >
                      {assignAwb.isPending ? "Assigning..." : "Assign AWB"}
                    </button>
                  </div>
                )}

                {status === "awb_assigned" && (
                  <button
                    onClick={() => requestPickup.mutate()}
                    disabled={requestPickup.isPending}
                    className="w-full bg-[#D4AF37] hover:bg-white text-black font-bold py-3 rounded-md transition-colors"
                  >
                    {requestPickup.isPending ? "Scheduling..." : "Schedule Pickup"}
                  </button>
                )}

                {(status === "pickup_scheduled" || status === "shipped") && !shipping.labelUrl && (
                  <button
                    onClick={() => generateLabel.mutate()}
                    disabled={generateLabel.isPending}
                    className="w-full bg-white hover:bg-[#D4AF37] text-black font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {generateLabel.isPending ? "Generating..." : "Generate Label"}
                  </button>
                )}

                {shipping.labelUrl && !shipping.manifestUrl && (
                  <div className="space-y-3">
                    <a href={shipping.labelUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold py-2 rounded-md transition-colors">
                      <Download className="w-4 h-4" /> Print Label
                    </a>
                    <button
                      onClick={() => generateManifest.mutate()}
                      disabled={generateManifest.isPending}
                      className="w-full bg-white hover:bg-[#D4AF37] text-black font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      {generateManifest.isPending ? "Generating..." : "Generate Manifest"}
                    </button>
                  </div>
                )}

                {shipping.manifestUrl && (
                  <div className="space-y-3">
                    <a href={shipping.labelUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold py-2 rounded-md transition-colors">
                      <Download className="w-4 h-4" /> Print Label
                    </a>
                    <a href={shipping.manifestUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold py-2 rounded-md transition-colors">
                      <Download className="w-4 h-4" /> Print Manifest
                    </a>
                    <div className="text-green-400 text-center text-sm font-bold mt-2">
                      Ready for Pickup!
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Payment Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Method</span>
                <span className="font-bold uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Status</span>
                <span className={`font-bold uppercase ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-bold">Total Amount</span>
                <span className="font-bold text-lg">₹{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
