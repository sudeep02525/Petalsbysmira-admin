"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import {
  HelpCircle,
  Plus,
  Save,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  FolderPlus,
} from "lucide-react";
import toast from "react-hot-toast";

export default function FaqsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/faqs");
      return res.data;
    },
  });

  const faqs = data?.faqs || [];

  // Form state for creating a new FAQ
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFaq, setNewFaq] = useState({
    category: "",
    question: "",
    answer: "",
    order: 0,
    isPublished: true,
  });

  // State for active inline editing FAQ
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post("/admin/faqs", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-faqs"]);
      toast.success("FAQ created successfully!");
      setShowAddModal(false);
      setNewFaq({
        category: "",
        question: "",
        answer: "",
        order: 0,
        isPublished: true,
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create FAQ");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const res = await axiosInstance.put(`/admin/faqs/${id}`, updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-faqs"]);
      toast.success("FAQ updated successfully!");
      setEditingId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update FAQ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/admin/faqs/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-faqs"]);
      toast.success("FAQ removed successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete FAQ");
    },
  });

  // Unique categories
  const categories = Array.from(new Set(faqs.map((f) => f.category))).filter(Boolean);

  const startEdit = (faq) => {
    setEditingId(faq._id);
    setEditFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      order: faq.order || 0,
      isPublished: faq.isPublished !== false,
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newFaq.category.trim() || !newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error("Category, question, and answer are all required.");
      return;
    }
    createMutation.mutate(newFaq);
  };

  const handleUpdateSubmit = (id) => {
    updateMutation.mutate({ id, updates: editFormData });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[var(--color-gold)]" /> Frequently Asked Questions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage inquiries, answers, order numbers, and client guidance categories.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New FAQ
        </button>
      </div>

      {/* Add FAQ Drawer / Modal */}
      {showAddModal && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white dark:bg-[#111] p-6 rounded-xl border border-[var(--color-gold)]/40 shadow-md space-y-4"
        >
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
            <h2 className="text-base font-bold font-serif text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[var(--color-gold)]" /> Create New Question
            </h2>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-xs text-gray-500 hover:text-black dark:hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={newFaq.category}
                onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                placeholder="e.g. Private Access & Exclusivity"
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                required
              />
              <datalist id="category-suggestions">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={newFaq.order}
                onChange={(e) => setNewFaq({ ...newFaq, order: Number(e.target.value) })}
                className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Question
            </label>
            <input
              type="text"
              value={newFaq.question}
              onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
              placeholder="e.g. How long does it take to receive private access approval?"
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white font-serif"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Answer
            </label>
            <textarea
              rows={3}
              value={newFaq.answer}
              onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
              placeholder="Detailed explanation..."
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={newFaq.isPublished}
                onChange={(e) => setNewFaq({ ...newFaq, isPublished: e.target.checked })}
                className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
              />
              Publish immediately
            </label>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-[var(--color-gold)] text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-110 transition shadow-sm disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save FAQ
            </button>
          </div>
        </form>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-gray-100 dark:bg-[#111] animate-pulse rounded-xl border border-gray-200 dark:border-gray-800"
            />
          ))}
        </div>
      )}

      {/* Grouped FAQs by Category */}
      <div className="space-y-8">
        {categories.map((cat) => {
          const catFaqs = faqs
            .filter((f) => f.category === cat)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          return (
            <div
              key={cat}
              className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
            >
              <div className="bg-gray-50 dark:bg-black/50 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-base font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-gold)]" />
                  {cat}
                </h2>
                <span className="text-xs text-gray-500 font-mono">
                  {catFaqs.length} {catFaqs.length === 1 ? "question" : "questions"}
                </span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {catFaqs.map((faq) => {
                  const isEditing = editingId === faq._id;

                  if (isEditing) {
                    return (
                      <div key={faq._id} className="p-6 bg-gray-50/50 dark:bg-black/40 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Category</label>
                            <input
                              type="text"
                              value={editFormData.category || ""}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, category: e.target.value })
                              }
                              className="w-full text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Order</label>
                            <input
                              type="number"
                              value={editFormData.order || 0}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  order: Number(e.target.value),
                                })
                              }
                              className="w-full text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Question</label>
                          <input
                            type="text"
                            value={editFormData.question || ""}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, question: e.target.value })
                            }
                            className="w-full text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white font-serif"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Answer</label>
                          <textarea
                            rows={3}
                            value={editFormData.answer || ""}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, answer: e.target.value })
                            }
                            className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-black text-gray-900 dark:text-white"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
                            <input
                              type="checkbox"
                              checked={editFormData.isPublished}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  isPublished: e.target.checked,
                                })
                              }
                              className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
                            />
                            Published
                          </label>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 text-xs text-gray-500 hover:text-black dark:hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateSubmit(faq._id)}
                              disabled={updateMutation.isPending}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded text-xs font-bold uppercase tracking-wider"
                            >
                              {updateMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={faq._id}
                      className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50/60 dark:hover:bg-black/30 transition-colors"
                    >
                      <div className="space-y-1.5 flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-[var(--color-gold)] font-medium">
                            Order #{faq.order || 0}
                          </span>
                          <button
                            onClick={() =>
                              updateMutation.mutate({
                                id: faq._id,
                                updates: { isPublished: !faq.isPublished },
                              })
                            }
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer ${
                              faq.isPublished !== false
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                            }`}
                            title="Click to toggle status"
                          >
                            {faq.isPublished !== false ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Published
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> Draft
                              </>
                            )}
                          </button>
                        </div>
                        <h3 className="text-sm font-serif font-semibold text-gray-900 dark:text-white">
                          {faq.question}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                          {faq.answer}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => startEdit(faq)}
                          className="p-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs flex items-center gap-1 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this FAQ?")) {
                              deleteMutation.mutate(faq._id);
                            }
                          }}
                          className="p-2 border border-gray-200 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 rounded-lg text-xs transition"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {categories.length === 0 && !isLoading && (
          <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500">
            <p className="text-sm">No FAQs found. Seed CMS or create your first question above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
