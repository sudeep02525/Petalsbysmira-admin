"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../../services/axiosInstance";
import toast from "react-hot-toast";
import { Loader2, Save, Key, User } from "lucide-react";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  
  // Profile State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // OTP Reset State
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Fallback to fetch profile if Zustand state is incomplete
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email && useAuthStore.getState().token) {
        try {
          const res = await axiosInstance.get("/admin/profile");
          setUser(res.data);
          setName(res.data.name || "");
          setEmail(res.data.email || "");
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }
      }
    };
    fetchProfile();
  }, [user, setUser]);

  // Resend OTP Timer
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await axiosInstance.put("/admin/profile", { name, email });
      setUser(res.data);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      await axiosInstance.post("/admin/forgot-password", { email: user?.email });
      toast.success("OTP sent to your email");
      setIsOtpMode(true);
      setResendTimer(60);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setIsUpdatingPassword(true);
    try {
      if (isOtpMode) {
        // Reset using OTP
        await axiosInstance.post("/admin/reset-password", { 
          email: user?.email, 
          otp, 
          newPassword 
        });
        toast.success("Password reset successfully");
        setIsOtpMode(false);
        setOtp("");
      } else {
        // Normal update with current password
        await axiosInstance.put("/admin/profile/password", { currentPassword, newPassword });
        toast.success("Password changed successfully");
      }
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold font-serif dark:text-white">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Settings */}
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold dark:text-white">Profile Information</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-sm focus:ring-[#D4AF37] focus:border-[#D4AF37] dark:text-white"
                placeholder="Admin Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                disabled
                readOnly
                value={email}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-500 rounded-lg text-sm cursor-not-allowed"
                placeholder="admin@example.com"
              />
              <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full flex justify-center items-center gap-2 bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-70"
              >
                {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Password Settings */}
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold dark:text-white">
                {isOtpMode ? "Reset Password" : "Change Password"}
              </h2>
            </div>
          </div>
          
          <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
            
            {isOtpMode ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enter OTP</label>
                  <button 
                    type="button" 
                    onClick={handleSendOtp} 
                    disabled={isSendingOtp || resendTimer > 0}
                    className="text-xs text-[#D4AF37] hover:underline font-medium disabled:opacity-50 disabled:hover:no-underline"
                  >
                    {isSendingOtp ? "Sending..." : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-sm focus:ring-[#D4AF37] focus:border-[#D4AF37] dark:text-white"
                  placeholder="6-digit OTP"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">OTP has been sent to {user?.email}</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                  <button 
                    type="button" 
                    onClick={handleSendOtp} 
                    disabled={isSendingOtp}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  >
                    {isSendingOtp ? "Sending..." : "Forgot password?"}
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-sm focus:ring-[#D4AF37] focus:border-[#D4AF37] dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-sm focus:ring-[#D4AF37] focus:border-[#D4AF37] dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-sm focus:ring-[#D4AF37] focus:border-[#D4AF37] dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full flex justify-center items-center gap-2 bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-70"
              >
                {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isUpdatingPassword ? (isOtpMode ? "Resetting..." : "Updating...") : (isOtpMode ? "Reset Password" : "Update Password")}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
