"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../services/axiosInstance";
import { useRouter } from "next/navigation";
import { UploadCloud, X, ArrowLeft, Check } from "lucide-react";

const schema = yup.object({
  name: yup.string().required("Name is required").trim(),
  shortSubtitle: yup.string().trim(),
  shortDescription: yup.string().required("Short description is required"),
  description: yup.string().required("Description is required"),
  price: yup.number().min(0).required("Price is required"),
  discountPrice: yup.number().min(0).nullable().transform((v, o) => o === "" ? null : v),
  category: yup.string().required("Category is required"),
  subCategory: yup.string().nullable(),
  stock: yup.number().integer("Must be an integer").min(0, "Cannot be negative").required("Stock is required"),
  isFeatured: yup.boolean(),
  isNewArrival: yup.boolean(),
  collectionId: yup.string().nullable(),
});

export default function AddProduct() {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitError, setSubmitError] = useState("");
  
  // Preview Modal State
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/categories");
      return res.data;
    },
  });

  const { data: collections = [], isLoading: isLoadingCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await axiosInstance.get("/collections");
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      isFeatured: false,
      isNewArrival: false,
      stock: 10,
      collectionId: "",
    },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 1) {
      alert("Maximum 1 image allowed");
      return;
    }

    setImages((prev) => [...prev, ...files]);
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onPreview = async () => {
    const isValid = await trigger();
    if (!isValid) return;
    
    if (images.length === 0) {
      setSubmitError("At least one product image is required.");
      return;
    }
    
    setSubmitError("");
    const data = getValues();
    const categoryObj = categories.find(c => c._id === data.category);
    
    setPreviewData({
      ...data,
      categoryName: categoryObj?.name || "Unknown",
      mainImage: imagePreviews[0]
    });
    
    setShowPreview(true);
  };

  const onSubmitFinal = async () => {
    try {
      setIsSubmittingForm(true);
      setSubmitError("");
      const formData = new FormData();
      
      const data = getValues();
      // Append all text data
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      
      // Append files
      images.forEach(image => {
        formData.append("images", image);
      });

      await axiosInstance.post("/admin/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      router.push("/products");
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Failed to create product");
      setShowPreview(false);
      setIsSubmittingForm(false);
    }
  };

  if (showPreview && previewData) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowPreview(false)} 
            className="flex items-center text-sm font-medium text-gray-500 hover:text-black"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Edit
          </button>
          <h1 className="text-2xl font-bold font-serif">Confirm Product Preview</h1>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative border border-gray-200">
              <img src={previewData.mainImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Stock</span>
                <span className="font-semibold">{previewData.stock} units</span>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3 flex flex-col justify-center">
            <p className="text-sm text-yellow-600 font-medium uppercase tracking-wider mb-1">
              {previewData.categoryName}
            </p>
            <h2 className="text-3xl font-serif text-gray-900 mb-4">{previewData.name}</h2>
            
            <div className="flex items-end gap-3 mb-6">
              <span className="text-2xl font-semibold text-gray-900">
                ₹{previewData.price}
              </span>
            </div>

            <p className="text-gray-600 mb-6">{previewData.shortDescription}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {previewData.isFeatured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Home Page Showcase</span>
              )}
            </div>

            <button
              onClick={onSubmitFinal}
              disabled={isSubmittingForm}
              className="w-full py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmittingForm ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              {isSubmittingForm ? "Publishing Product..." : "Confirm & Publish Product"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-serif">Add New Product</h1>
      </div>

      {submitError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{submitError}</p>
        </div>
      )}

      <form className="space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                {...register("name")}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Subtitle</label>
              <input
                type="text"
                placeholder="A statement of power."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                {...register("shortSubtitle")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                {...register("category")}
                disabled={isLoadingCategories}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
            <input
              type="text"
              placeholder="A brief summary for product cards..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
              {...register("shortDescription")}
            />
            {errors.shortDescription && <p className="mt-1 text-xs text-red-500">{errors.shortDescription.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
              {...register("description")}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                {...register("price")}
              />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                {...register("discountPrice")}
              />
              {errors.discountPrice && <p className="mt-1 text-xs text-red-500">{errors.discountPrice.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty *</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                {...register("stock")}
              />
              {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Home Page Visibility</h2>
          
          <div className="flex flex-wrap items-center gap-6 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded w-4 h-4 border-gray-300 text-black focus:ring-black" {...register("isFeatured")} />
              <span className="text-sm font-medium text-gray-800">Show in Home Page Sections</span>
            </label>
            
            <div className="flex items-center gap-3 border-l border-gray-300 pl-6">
              <label className="text-sm font-medium text-gray-700">Select Section:</label>
              <select
                className="px-3 py-1.5 border border-gray-300 rounded-md focus:ring-black focus:border-black text-sm min-w-[200px]"
                {...register("collectionId")}
              >
                <option value="">Same as Product Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Product Image</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {imagePreviews.map((src, index) => (
              <div key={index} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50 group">
                <img src={src} alt="Preview" className="w-full h-full object-cover" />
                {index === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1 font-medium">Main Image</span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {imagePreviews.length < 1 && (
              <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition-colors bg-white">
                <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-[10px] text-gray-500 font-medium">Upload Image</span>
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
          {images.length === 0 && <p className="text-xs text-red-500 mt-2">At least one image is required.</p>}
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onPreview}
            className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Preview Product
          </button>
        </div>
      </form>
    </div>
  );
}
