"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../services/axiosInstance";
import { Save, Loader2, Home, Sparkles, Image as ImageIcon, Layers, Quote, Diamond, Gem, Shield, Gift } from "lucide-react";
import toast from "react-hot-toast";

export default function HomepageCmsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      const res = await axiosInstance.get("/site-settings");
      return res.data;
    },
  });

  const [formData, setFormData] = useState({
    heroImageUrl: "",
    heroLine1: "",
    heroLine2: "",
    heroLine3: "",
    heroSubLine1: "",
    heroSubLine2: "",
    heroCta1Label: "",
    heroCta1Href: "",
    heroCta2Label: "",
    heroCta2Href: "",
    heroQuote: "",
    closingQuote: "",
    features: [
      { icon: "diamond", title: "", subtitle: "" },
      { icon: "gem", title: "", subtitle: "" },
      { icon: "shield", title: "", subtitle: "" },
      { icon: "gift", title: "", subtitle: "" },
    ],
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        heroImageUrl: settings.heroImageUrl || "/image.jpg",
        heroLine1: settings.heroLine1 || "Not everything",
        heroLine2: settings.heroLine2 || "extraordinary comes",
        heroLine3: settings.heroLine3 || "with a price tag.",
        heroSubLine1: settings.heroSubLine1 || "Luxury Editions from ₹4,999 to ₹1,00,000",
        heroSubLine2: settings.heroSubLine2 || "Access is limited.",
        heroCta1Label: settings.heroCta1Label || "EXPLORE THE EDITIONS",
        heroCta1Href: settings.heroCta1Href || "/editions",
        heroCta2Label: settings.heroCta2Label || "REQUEST ACCESS",
        heroCta2Href: settings.heroCta2Href || "/request-access",
        heroQuote: settings.heroQuote || "A statement, not just a jewel.",
        closingQuote: settings.closingQuote || "Because your worth has no price tag.",
        features: settings.features?.length === 4
          ? settings.features
          : [
              { icon: "diamond", title: "Curated Luxury", subtitle: "Handpicked for you" },
              { icon: "gem", title: "Limited Editions", subtitle: "Not for everyone" },
              { icon: "shield", title: "Private Access", subtitle: "Exclusively yours" },
              { icon: "gift", title: "Personal Experience", subtitle: "Curated with care" },
            ],
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
      toast.success("Homepage content saved successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update homepage content");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleFeatureChange = (index, field, value) => {
    const updated = [...formData.features];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, features: updated });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading homepage content...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white flex items-center gap-2">
            <Home className="w-6 h-6 text-[var(--color-gold)]" /> Homepage CMS
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Control the hero headlines, background imagery, calls-to-action, feature strip, and luxury quotes.
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

      {/* Hero Headline & Imagery */}
      <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-gold)]" /> Hero Headlines &amp; Imagery
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hero Background Image URL</label>
            <input
              type="text"
              value={formData.heroImageUrl}
              onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
              placeholder="/image.jpg or https://res.cloudinary.com/..."
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Headline Line 1</label>
              <input
                type="text"
                value={formData.heroLine1}
                onChange={(e) => setFormData({ ...formData, heroLine1: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white font-serif"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Headline Line 2</label>
              <input
                type="text"
                value={formData.heroLine2}
                onChange={(e) => setFormData({ ...formData, heroLine2: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white font-serif"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Headline Line 3 (Calligraphy / Gold)</label>
              <input
                type="text"
                value={formData.heroLine3}
                onChange={(e) => setFormData({ ...formData, heroLine3: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white font-serif"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sub-headline Line 1</label>
              <input
                type="text"
                value={formData.heroSubLine1}
                onChange={(e) => setFormData({ ...formData, heroSubLine1: e.target.value })}
                placeholder="Luxury Editions from ₹4,999 to ₹1,00,000"
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sub-headline Line 2</label>
              <input
                type="text"
                value={formData.heroSubLine2}
                onChange={(e) => setFormData({ ...formData, heroSubLine2: e.target.value })}
                placeholder="Access is limited."
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hero Floating Quote</label>
            <input
              type="text"
              value={formData.heroQuote}
              onChange={(e) => setFormData({ ...formData, heroQuote: e.target.value })}
              placeholder="A statement, not just a jewel."
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white italic font-serif"
            />
          </div>
        </div>
      </div>

      {/* Hero Action Buttons (CTAs) */}
      <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
          Hero Action Buttons
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 p-4 rounded-lg bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Primary Button</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Label</label>
              <input
                type="text"
                value={formData.heroCta1Label}
                onChange={(e) => setFormData({ ...formData, heroCta1Label: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Link URL</label>
              <input
                type="text"
                value={formData.heroCta1Href}
                onChange={(e) => setFormData({ ...formData, heroCta1Href: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Secondary Button</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Label</label>
              <input
                type="text"
                value={formData.heroCta2Label}
                onChange={(e) => setFormData({ ...formData, heroCta2Label: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Link URL</label>
              <input
                type="text"
                value={formData.heroCta2Href}
                onChange={(e) => setFormData({ ...formData, heroCta2Href: e.target.value })}
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Strip (4 items) */}
      <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--color-gold)]" /> Feature Strip (4 Guarantees)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.features.map((feature, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">Feature #{idx + 1}</span>
                <select
                  value={feature.icon}
                  onChange={(e) => handleFeatureChange(idx, "icon", e.target.value)}
                  className="text-xs border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-black text-gray-900 dark:text-white"
                >
                  <option value="diamond">Diamond</option>
                  <option value="gem">Gem</option>
                  <option value="shield">Shield</option>
                  <option value="gift">Gift</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  value={feature.title}
                  onChange={(e) => handleFeatureChange(idx, "title", e.target.value)}
                  className="w-full text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={feature.subtitle}
                  onChange={(e) => handleFeatureChange(idx, "subtitle", e.target.value)}
                  className="w-full text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white italic text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Closing Quote */}
      <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
          <Quote className="w-4 h-4 text-[var(--color-gold)]" /> Closing Brand Quote
        </h2>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Quote Text (displayed below feature strip)</label>
          <input
            type="text"
            value={formData.closingQuote}
            onChange={(e) => setFormData({ ...formData, closingQuote: e.target.value })}
            placeholder="Because your worth has no price tag."
            className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white italic font-serif"
          />
        </div>
      </div>
    </form>
  );
}
