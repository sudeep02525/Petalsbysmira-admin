"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../../services/axiosInstance";
import { useRouter, useParams } from "next/navigation";
import { UploadCloud, X, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const schema = yup.object({
  name: yup.string().required("Name is required").trim(),
  shortSubtitle: yup.string().trim(),
  sku: yup.string().nullable().trim(),
  shortDescription: yup.string().required("Short description is required"),
  description: yup.string().required("Description is required"),
  price: yup.number().positive("Price must be positive").required("Price is required"),
  discountPrice: yup.number().nullable().transform((v, o) => (o === "" || isNaN(v) ? null : v)).test(
    'is-less-than-price',
    'Discount price must be less than original price',
    function(value) {
      const { price } = this.parent;
      if (value && price && value > price) return false;
      return true;
    }
  ),
  category: yup.string().required("Category is required"),
  subCategory: yup.string().nullable(),
  stock: yup.number().integer("Must be an integer").min(0, "Cannot be negative").required("Stock is required"),
  occasionTags: yup.string(),
  isFeatured: yup.boolean(),
  isNewArrival: yup.boolean(),
  isActive: yup.boolean(),
  limitedEdition: yup.boolean(),
  requestAccessEnabled: yup.boolean(),
  displayOrder: yup.number().integer().default(0),
});

export default function EditProduct() {
  const router = useRouter();
  const { id } = useParams();
  
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  
  const [submitError, setSubmitError] = useState("");
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/categories");
      return res.data;
    },
  });

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/products/${id}`);
      return res.data.product || res.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku || "",
        shortDescription: product.shortDescription || "",
        description: product.description || "",
        price: product.price,
        discountPrice: product.discountPrice || "",
        category: product.category?._id || product.category,
        subCategory: product.subCategory || "",
        stock: product.stock,
        occasionTags: product.occasionTags ? product.occasionTags.join(", ") : "",
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false,
        isActive: product.isActive !== undefined ? product.isActive : true,
        limitedEdition: product.limitedEdition || false,
        requestAccessEnabled: product.requestAccessEnabled !== undefined ? product.requestAccessEnabled : true,
        displayOrder: product.displayOrder || 0,
      });
      setExistingImages(product.images || []);
    }
  }, [product, reset]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImages.length + newImages.length > 5) {
      toast.error("Maximum 5 images allowed total");
      return;
    }

    setNewImages((prev) => [...prev, ...files]);
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (existingImages.length === 0 && newImages.length === 0) {
      setSubmitError("At least one product image is required.");
      window.scrollTo(0, 0);
      return;
    }

    try {
      setIsSubmittingForm(true);
      setSubmitError("");
      const formData = new FormData();
      
      // Append all text data
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      
      // Append existing images to keep
      existingImages.forEach(img => {
        formData.append("existingImages", img);
      });
      
      // Append new files
      newImages.forEach(image => {
        formData.append("images", image);
      });

      await axiosInstance.put(`/admin/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product updated successfully");
      router.push("/products");
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Failed to update product");
      setIsSubmittingForm(false);
      window.scrollTo(0, 0);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 text-gray-900 dark:text-white">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold font-serif">Edit Product</h1>
      </div>

      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
          <p className="text-red-700 dark:text-red-400">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white dark:bg-[#0a0a0a] p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-800 pb-2 text-gray-900 dark:text-white">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600"
                {...register("name")}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Subtitle</label>
              <input
                type="text"
                placeholder="A statement of power."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600 placeholder-gray-400 dark:placeholder-gray-600"
                {...register("shortSubtitle")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600"
                {...register("category")}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Description *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600"
              {...register("shortDescription")}
            />
            {errors.shortDescription && <p className="mt-1 text-xs text-red-500">{errors.shortDescription.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Description *</label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600"
              {...register("description")}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-800 pb-2 text-gray-900 dark:text-white">Internal Valuation & Inventory</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">Prices are internal only and never displayed to customers.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Internal Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600"
                {...register("price")}
              />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Price (₹)</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600"
                {...register("discountPrice")}
              />
              {errors.discountPrice && <p className="mt-1 text-xs text-red-500">{errors.discountPrice.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Qty *</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600"
                {...register("stock")}
              />
              {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU (Optional)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600"
                {...register("sku")}
              />
            </div>
          </div>
        </div>

        {/* Visibility & Tags */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-800 pb-2 text-gray-900 dark:text-white">Organization & Status</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occasion Tags (comma separated)</label>
            <input
              type="text"
              placeholder="Rakhi, Birthday, Wedding, Festive"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600 placeholder-gray-400 dark:placeholder-gray-600"
              {...register("occasionTags")}
            />
          </div>
          
          <div className="flex flex-wrap gap-6 mt-4 p-4 bg-gray-50 dark:bg-[#111] rounded-lg border border-gray-200 dark:border-gray-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded w-4 h-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:ring-black dark:focus:ring-gray-600" {...register("isFeatured")} />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded w-4 h-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:ring-black dark:focus:ring-gray-600" {...register("limitedEdition")} />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Limited Edition</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded w-4 h-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:ring-black dark:focus:ring-gray-600" {...register("requestAccessEnabled")} />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Enable Private Access</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded w-4 h-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-blue-600 focus:ring-blue-600" {...register("isActive")} />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-400">Active</span>
            </label>
          </div>
          
          <div className="mt-4 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order (Sorting)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:ring-black dark:focus:ring-gray-600 focus:border-black dark:focus:border-gray-600"
              {...register("displayOrder")}
            />
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Images (Up to 5)</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{existingImages.length + newImages.length} / 5</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* Existing Images */}
            {existingImages.map((src, index) => (
              <div key={`existing-${index}`} className="relative aspect-square rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-[#111] group">
                <img src={src} alt="Existing Preview" className="w-full h-full object-cover" />
                {index === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1 font-medium">Main Image</span>
                )}
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* New Image Previews */}
            {newImagePreviews.map((src, index) => (
              <div key={`new-${index}`} className="relative aspect-square rounded-lg border-2 border-green-200 overflow-hidden bg-green-50 group">
                <img src={src} alt="New Preview" className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-2 rounded-full font-bold">NEW</span>
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {/* Upload Button */}
            {(existingImages.length + newImages.length) < 5 && (
              <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-black dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors bg-white dark:bg-[#1a1a1a]">
                <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Upload Image</span>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
          {(existingImages.length + newImages.length) === 0 && <p className="text-xs text-red-500 mt-2">At least one image is required.</p>}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            type="submit"
            disabled={isSubmittingForm}
            className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isSubmittingForm && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmittingForm ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
