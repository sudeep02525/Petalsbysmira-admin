"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../services/axiosInstance";
import {
  Save,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Globe,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

const SECTION_TYPES = [
  { value: "text", label: "Text Block (Editorial)" },
  { value: "imageText", label: "Image + Text (Split)" },
  { value: "step", label: "Process Step (01 Discover...)" },
  { value: "card", label: "Feature Card" },
  { value: "richText", label: "Rich Text Article (Policy/Terms)" },
];

export default function PageEditor({ params }) {
  const unwrappedParams = use(params);
  const { slug } = unwrappedParams;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: pageData, isLoading } = useQuery({
    queryKey: ["admin-page", slug],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/pages/${slug}`);
      return res.data;
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    heroImageUrl: "",
    isPublished: true,
    sections: [],
    seo: {
      title: "",
      description: "",
      ogImageUrl: "",
    },
  });

  const [showSeo, setShowSeo] = useState(false);

  useEffect(() => {
    if (pageData) {
      setFormData({
        title: pageData.title || "",
        subtitle: pageData.subtitle || "",
        heroImageUrl: pageData.heroImageUrl || "",
        isPublished: pageData.isPublished !== false,
        sections: (pageData.sections || []).map((s, idx) => ({
          ...s,
          order: s.order !== undefined ? s.order : idx,
        })),
        seo: {
          title: pageData.seo?.title || "",
          description: pageData.seo?.description || "",
          ogImageUrl: pageData.seo?.ogImageUrl || "",
        },
      });
    }
  }, [pageData]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.put(`/admin/pages/${slug}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-pages"]);
      queryClient.invalidateQueries(["admin-page", slug]);
      toast.success("Page saved successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save page");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const addSection = (type = "text") => {
    const newSection = {
      type,
      order: formData.sections.length,
      number: String(formData.sections.length + 1).padStart(2, "0"),
      subheading: "",
      heading: "",
      body: "",
      imageUrl: "",
    };
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const updateSection = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.sections];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sections: updated };
    });
  };

  const removeSection = (index) => {
    setFormData((prev) => {
      const filtered = prev.sections.filter((_, idx) => idx !== index);
      const reordered = filtered.map((s, idx) => ({ ...s, order: idx }));
      return { ...prev, sections: reordered };
    });
  };

  const moveSection = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.sections.length) return;

    setFormData((prev) => {
      const list = [...prev.sections];
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      const reordered = list.map((s, idx) => ({ ...s, order: idx }));
      return { ...prev, sections: reordered };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading page editor...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/pages"
            className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[var(--color-gold)] font-medium">
                /{slug}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  formData.isPublished
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                }`}
              >
                {formData.isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mt-1">
              {formData.title || slug}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`https://petalsbysmira.in/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--color-gold)]" /> View Live
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-sm disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Page
          </button>
        </div>
      </div>

      {/* Main Page Settings (Hero & Status) */}
      <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Page Header &amp; Visibility
          </h2>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
            />
            Published
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hero Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hero Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hero Background Image URL (Optional)
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={formData.heroImageUrl}
              onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
              placeholder="/image.jpg or https://res.cloudinary.com/..."
              className="flex-1 text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white font-mono text-xs"
            />
            {formData.heroImageUrl && (
              <img
                src={formData.heroImageUrl}
                alt="Hero Preview"
                className="w-10 h-10 object-cover rounded border border-gray-300 dark:border-gray-700"
              />
            )}
          </div>
        </div>
      </div>

      {/* Sections Manager */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-serif text-gray-900 dark:text-white">
              Content Sections ({formData.sections.length})
            </h2>
            <p className="text-xs text-gray-500">
              Drag, reorder, or customize each section block displayed on the page.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => addSection("imageText")}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Image + Text
            </button>
            <button
              type="button"
              onClick={() => addSection("step")}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Step Block
            </button>
            <button
              type="button"
              onClick={() => addSection("richText")}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Article / Policy
            </button>
          </div>
        </div>

        {formData.sections.map((section, idx) => (
          <div
            key={section._id || idx}
            className="bg-white dark:bg-[#111] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-all"
          >
            {/* Section Card Toolbar */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[var(--color-gold)] bg-[var(--color-gold)]/10 px-2 py-0.5 rounded">
                  #{idx + 1}
                </span>

                <select
                  value={section.type}
                  onChange={(e) => updateSection(idx, "type", e.target.value)}
                  className="text-xs font-semibold border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-gray-50 dark:bg-black text-gray-900 dark:text-white"
                >
                  {SECTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveSection(idx, -1)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === formData.sections.length - 1}
                  onClick={() => moveSection(idx, 1)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(idx)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 rounded ml-2"
                  title="Delete Section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inputs based on section type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Step / Badge (e.g. 01)
                </label>
                <input
                  type="text"
                  value={section.number || ""}
                  onChange={(e) => updateSection(idx, "number", e.target.value)}
                  placeholder="01"
                  className="w-full text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Subheading
                </label>
                <input
                  type="text"
                  value={section.subheading || ""}
                  onChange={(e) => updateSection(idx, "subheading", e.target.value)}
                  placeholder="The Beginning"
                  className="w-full text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Main Heading
                </label>
                <input
                  type="text"
                  value={section.heading || ""}
                  onChange={(e) => updateSection(idx, "heading", e.target.value)}
                  placeholder="Born from a desire for the extraordinary..."
                  className="w-full text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white font-serif"
                />
              </div>
            </div>

            {/* Image URL (for imageText or card) */}
            {(section.type === "imageText" || section.type === "card") && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Section Image URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={section.imageUrl || ""}
                    onChange={(e) => updateSection(idx, "imageUrl", e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="flex-1 text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white font-mono text-xs"
                  />
                  {section.imageUrl && (
                    <img
                      src={section.imageUrl}
                      alt="Thumbnail"
                      className="w-10 h-10 object-cover rounded border border-gray-300 dark:border-gray-700"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Body Textarea */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Body Content (supports paragraphs and bullet points)
              </label>
              <textarea
                rows={4}
                value={section.body || ""}
                onChange={(e) => updateSection(idx, "body", e.target.value)}
                placeholder="Enter section copy..."
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white leading-relaxed font-sans"
              />
            </div>
          </div>
        ))}

        {formData.sections.length === 0 && (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500">
            <p className="text-sm">No content sections created yet.</p>
            <button
              type="button"
              onClick={() => addSection("text")}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Section
            </button>
          </div>
        )}
      </div>

      {/* SEO Accordion */}
      <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSeo(!showSeo)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-black/30 transition"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[var(--color-gold)]" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Search Engine Optimization (SEO) &amp; Open Graph
            </span>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {showSeo ? "Hide ▲" : "Configure ▼"}
          </span>
        </button>

        {showSeo && (
          <div className="p-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                SEO Meta Title
              </label>
              <input
                type="text"
                value={formData.seo?.title || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, title: e.target.value },
                  })
                }
                placeholder={`${formData.title || slug} | Petals by Smira`}
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                SEO Meta Description
              </label>
              <textarea
                rows={2}
                value={formData.seo?.description || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, description: e.target.value },
                  })
                }
                placeholder="Concise overview for Google search results..."
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Open Graph Social Share Image URL
              </label>
              <input
                type="text"
                value={formData.seo?.ogImageUrl || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, ogImageUrl: e.target.value },
                  })
                }
                placeholder="https://res.cloudinary.com/.../og-share.jpg"
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white font-mono text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Save Bar */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-lg disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
}
