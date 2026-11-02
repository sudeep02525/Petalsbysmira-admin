"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { FileText, ExternalLink, Edit3, CheckCircle2, Clock, Globe } from "lucide-react";
import dayjs from "dayjs";

const DEFAULT_KNOWN_PAGES = [
  { slug: "our-story", title: "Our Story", defaultSubtitle: "The heritage behind the house" },
  { slug: "experience", title: "The Experience", defaultSubtitle: "Luxury, curated differently" },
  { slug: "privacy", title: "Privacy Policy", defaultSubtitle: "Discretion & Trust" },
  { slug: "terms", title: "Terms of Service", defaultSubtitle: "Maison Protocols" },
];

export default function PagesListPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/pages");
      return res.data;
    },
  });

  const apiPages = data?.pages || [];

  // Merge known default pages so admin can always click and edit any core page
  const pageMap = new Map();
  DEFAULT_KNOWN_PAGES.forEach((dp) => {
    pageMap.set(dp.slug, {
      slug: dp.slug,
      title: dp.title,
      isPublished: true,
      updatedAt: null,
    });
  });
  apiPages.forEach((p) => {
    pageMap.set(p.slug, { ...pageMap.get(p.slug), ...p });
  });

  const allPages = Array.from(pageMap.values());

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-[var(--color-gold)]" /> Website Pages
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage page editorial copy, sections, imagery, and SEO metadata.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 dark:bg-[#111] animate-pulse rounded-xl border border-gray-200 dark:border-gray-800"
            />
          ))}
        </div>
      )}

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {allPages.map((p) => {
          const isPublished = p.isPublished !== false;
          return (
            <div
              key={p.slug}
              className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-[var(--color-gold)]/50 transition-all shadow-sm group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-[var(--color-gold)] font-medium">
                    /{p.slug}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      isPublished
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                    }`}
                  >
                    {isPublished ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </>
                    ) : (
                      "Draft"
                    )}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-semibold text-gray-900 dark:text-white group-hover:text-[var(--color-gold)] transition-colors">
                  {p.title || p.slug}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {p.updatedAt ? `Updated ${dayjs(p.updatedAt).format("DD MMM YYYY, hh:mm A")}` : "Default content active"}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-800/80">
                <a
                  href={`https://petalsbysmira.in/${p.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" /> View Live
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>

                <Link
                  href={`/pages/${p.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Page
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

