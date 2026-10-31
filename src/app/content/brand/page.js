"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../services/axiosInstance";
import { Save, Loader2, Globe, Phone, Mail, MapPin, Instagram, Facebook, Twitter, Bell, Shield, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function BrandSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      const res = await axiosInstance.get("/site-settings");
      return res.data;
    },
  });

  const [formData, setFormData] = useState({
    brandName: "",
    logoUrl: "",
    faviconUrl: "",
    phone: "",
    whatsappNumber: "",
    email: "",
    address: "",
    instagramUrl: "",
    facebookUrl: "",
    twitterUrl: "",
    announcementEnabled: false,
    announcementText: "",
    privateBannerText: "",
    priceLabel: "",
    priceOnRequestLabel: "",
    productCtaLabel: "",
    productTrustLines: ["", "", ""],
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        brandName: settings.brandName || "Petals by Smira",
        logoUrl: settings.logoUrl || "/logo.jpg",
        faviconUrl: settings.faviconUrl || "/fabicon.png",
        phone: settings.phone || "+91 99206 88099",
        whatsappNumber: settings.whatsappNumber || "919920688099",
        email: settings.email || "petalsbysmira@gmail.com",
        address: settings.address || "Mumbai, Maharashtra, India",
        instagramUrl: settings.instagramUrl || "",
        facebookUrl: settings.facebookUrl || "",
        twitterUrl: settings.twitterUrl || "",
        announcementEnabled: Boolean(settings.announcementEnabled),
        announcementText: settings.announcementText || "",
        privateBannerText: settings.privateBannerText || "Private Access Active",
        priceLabel: settings.priceLabel || "Exclusive Price",
        priceOnRequestLabel: settings.priceOnRequestLabel || "Price on Request",
        productCtaLabel: settings.productCtaLabel || "Enquire to Purchase",
        productTrustLines: settings.productTrustLines?.length
          ? settings.productTrustLines
          : ["Personal Consultation Included", "Insured Priority Delivery", "Certificate of Authenticity"],
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      const res = await axiosInstance.put("/site-settings", updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["siteSettings"]);
      toast.success("Brand & Contact settings saved successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update settings");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading brand settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-[var(--color-gold)]" /> Brand &amp; Contact Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your boutique identity, contact information, social links, and global banners.
          </p>
        </div>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-sm disabled:opacity-50"
        >
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Brand Identity */}
      <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
          Brand Identity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Brand Name</label>
            <input
              type="text"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL</label>
            <input
              type="text"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Favicon URL</label>
            <input
              type="text"
              value={formData.faviconUrl}
              onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-[var(--color-gold)]" /> Contact &amp; Concierge
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Display Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 99206 88099"
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp Number (digits only)</label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="919920688099"
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Concierge Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="concierge@petalsbysmira.in"
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location / Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Mumbai, Maharashtra, India"
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Social Profiles */}
      <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
          <Instagram className="w-4 h-4 text-[var(--color-gold)]" /> Social Profiles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram URL</label>
            <input
              type="url"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/petalsbysmira"
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook URL</label>
            <input
              type="url"
              value={formData.facebookUrl}
              onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              placeholder="https://facebook.com/..."
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter / X URL</label>
            <input
              type="url"
              value={formData.twitterUrl}
              onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
              placeholder="https://x.com/..."
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Banners */}
      <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-[var(--color-gold)]" /> Global Banners
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="announcementEnabled"
              checked={formData.announcementEnabled}
              onChange={(e) => setFormData({ ...formData, announcementEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black"
            />
            <label htmlFor="announcementEnabled" className="text-sm font-medium text-gray-900 dark:text-white">
              Enable Top Announcement Bar
            </label>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Announcement Message</label>
            <input
              type="text"
              value={formData.announcementText}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
              placeholder="Complimentary delivery across India on private editions"
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Private Access Floating Banner Text</label>
            <input
              type="text"
              value={formData.privateBannerText}
              onChange={(e) => setFormData({ ...formData, privateBannerText: e.target.value })}
              placeholder="Private Access Active"
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Product Detail Labels & Trust Lines */}
      <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--color-gold)]" /> Product Page Labels &amp; Trust Lines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Price Label</label>
            <input
              type="text"
              value={formData.priceLabel}
              onChange={(e) => setFormData({ ...formData, priceLabel: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Price on Request Label</label>
            <input
              type="text"
              value={formData.priceOnRequestLabel}
              onChange={(e) => setFormData({ ...formData, priceOnRequestLabel: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Product CTA Label</label>
            <input
              type="text"
              value={formData.productCtaLabel}
              onChange={(e) => setFormData({ ...formData, productCtaLabel: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Trust Badges / Guarantees (3 items shown below CTA on product detail page)
          </label>
          {formData.productTrustLines.map((line, idx) => (
            <input
              key={idx}
              type="text"
              value={line}
              onChange={(e) => {
                const updated = [...formData.productTrustLines];
                updated[idx] = e.target.value;
                setFormData({ ...formData, productTrustLines: updated });
              }}
              placeholder={`Trust line ${idx + 1}`}
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white mb-2"
            />
          ))}
        </div>
      </div>
    </form>
  );
}

