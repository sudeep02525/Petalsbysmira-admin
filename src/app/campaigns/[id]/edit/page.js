"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, X, Loader2, Save } from "lucide-react";
import axiosInstance from "../../../../services/axiosInstance";
import toast from "react-hot-toast";

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // existing images coming from DB
  const [existingImages, setExistingImages] = useState([]);
  // new files added locally
  const [newImages, setNewImages] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "active",
    priority: 0,
    displayOrder: 0,
    cta: {
      enabled: false,
      text: "Shop Now",
      link: "/shop"
    }
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const { data } = await axiosInstance.get(`/admin/campaigns/${campaignId}`);
        const campaign = data.campaign;
        
        // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
        const formatForInput = (isoString) => {
          if (!isoString) return "";
          const date = new Date(isoString);
          return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        };

        setFormData({
          title: campaign.title || "",
          subtitle: campaign.subtitle || "",
          description: campaign.description || "",
          startDate: formatForInput(campaign.startDate),
          endDate: formatForInput(campaign.endDate),
          status: campaign.status || "draft",
          priority: campaign.priority || 0,
          displayOrder: campaign.displayOrder || 0,
          cta: campaign.cta || { enabled: false, text: "Shop Now", link: "/shop" }
        });

        if (campaign.images) {
          setExistingImages(campaign.images.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
        }
      } catch (error) {
        toast.error("Failed to fetch campaign details");
        router.push("/campaigns");
      } finally {
        setIsLoading(false);
      }
    };
    if (campaignId) fetchCampaign();
  }, [campaignId, router]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast.error("Some files exceed the 5MB limit and were skipped");
    }
    
    const addedImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      alt: "",
      title: "",
      link: "",
      enabled: true
    }));

    setNewImages(prev => [...prev, ...addedImages]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const removeNewImage = (index) => {
    setNewImages(prev => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const updateExistingImageConfig = (index, field, value) => {
    setExistingImages(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const updateNewImageConfig = (index, field, value) => {
    setNewImages(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      return toast.error("Please fill all required fields");
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return toast.error("End date must be after start date");
    }
    if (existingImages.length === 0 && newImages.length === 0) {
      return toast.error("Please add at least one image");
    }

    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      
      // Append new files
      newImages.forEach(img => {
        submitData.append("images", img.file);
      });
      
      // Create configs payload
      const newImageConfigs = newImages.map((img, idx) => ({
        alt: img.alt,
        title: img.title,
        link: img.link,
        enabled: img.enabled,
        displayOrder: existingImages.length + idx
      }));

      submitData.append("data", JSON.stringify({
        ...formData,
        existingImages, // Keep these exactly as is (backend handles merging)
        newImageConfigs
      }));

      await axiosInstance.put(`/admin/campaigns/${campaignId}`, submitData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success("Campaign updated successfully");
      router.push("/campaigns");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/campaigns" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-black text-white px-6 py-2.5 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info & Dates */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Images *</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {/* Existing Images */}
              {existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="relative border border-gray-200 rounded-lg overflow-hidden group bg-gray-50 flex flex-col">
                  <div className="aspect-[4/3] relative">
                    <img src={img.url} alt={`existing ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-600 hover:bg-white hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {!img.enabled && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-black text-white text-xs px-2 py-1 rounded">Disabled</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-2 text-xs">
                    <input 
                      type="text" 
                      placeholder="Link (Optional)" 
                      value={img.link} 
                      onChange={(e) => updateExistingImageConfig(index, 'link', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={img.enabled} 
                        onChange={(e) => updateExistingImageConfig(index, 'enabled', e.target.checked)}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-gray-600">Enabled</span>
                    </label>
                  </div>
                </div>
              ))}

              {/* New Images */}
              {newImages.map((img, index) => (
                <div key={`new-${index}`} className="relative border border-gray-200 rounded-lg overflow-hidden group bg-green-50 flex flex-col">
                  <div className="aspect-[4/3] relative border-b-4 border-green-400">
                    <img src={img.preview} alt={`preview ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-600 hover:bg-white hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {!img.enabled && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-black text-white text-xs px-2 py-1 rounded">Disabled</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-2 text-xs">
                    <input 
                      type="text" 
                      placeholder="Link (Optional)" 
                      value={img.link} 
                      onChange={(e) => updateNewImageConfig(index, 'link', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={img.enabled} 
                        onChange={(e) => updateNewImageConfig(index, 'enabled', e.target.checked)}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-gray-600">Enabled</span>
                    </label>
                  </div>
                </div>
              ))}
              
              <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-full min-h-[160px] cursor-pointer hover:bg-gray-50 transition-colors">
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 font-medium">Add Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule & Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Campaign will only show if Active AND within dates.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Call to Action (CTA)</h2>
              <label className="flex items-center cursor-pointer relative">
                <input
                  type="checkbox"
                  checked={formData.cta?.enabled}
                  onChange={(e) => setFormData({...formData, cta: {...formData.cta, enabled: e.target.checked}})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
            
            {formData.cta?.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.cta.text}
                    onChange={(e) => setFormData({...formData, cta: {...formData.cta, text: e.target.value}})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={formData.cta.link}
                    onChange={(e) => setFormData({...formData, cta: {...formData.cta, link: e.target.value}})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
