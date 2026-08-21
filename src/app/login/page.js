"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import { Lock, Mail, X, Eye, EyeOff } from "lucide-react";
import axiosInstance from "../../services/axiosInstance";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    setForgotMessage("");
    try {
      const res = await axiosInstance.post("/admin/forgot-password", { email: forgotEmail });
      setForgotMessage(res.data.message);
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    setForgotMessage("");
    try {
      const res = await axiosInstance.post("/admin/reset-password", { 
        email: forgotEmail, 
        otp: forgotOtp, 
        newPassword 
      });
      setForgotMessage(res.data.message);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail("");
        setForgotOtp("");
        setNewPassword("");
        setForgotMessage("");
      }, 3000);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");
    const res = await login(data.email, data.password);
    setIsLoading(false);
    if (res.success) {
      router.push("/");
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37] opacity-20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37] opacity-10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-md w-full space-y-8 bg-black/40 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-gray-800 relative z-10">
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-white font-serif tracking-tight">
            Admin Panel
          </h2>
          <p className="mt-3 text-center text-sm text-gray-400">
            Sign in to manage your premium store
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  type="email"
                  autoComplete="email"
                  className="appearance-none block w-full px-3 py-3.5 pl-10 border border-gray-700 bg-gray-900/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent sm:text-sm transition-all"
                  placeholder="admin@example.com"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="appearance-none block w-full px-3 py-3.5 pl-10 pr-10 border border-gray-700 bg-gray-900/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent sm:text-sm transition-all"
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#D4AF37] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotError("");
                  setForgotMessage("");
                  setForgotStep(1);
                }}
                className="font-medium text-gray-400 hover:text-[#D4AF37] transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-black bg-[#D4AF37] hover:bg-[#c4a133] shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#D4AF37] disabled:opacity-50 transition-all duration-300"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold font-serif mb-4">Reset Password</h3>
            
            {forgotError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">
                {forgotError}
              </div>
            )}
            
            {forgotMessage && (
              <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md mb-4">
                {forgotMessage}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                    placeholder="Enter your admin email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {forgotLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OTP Received</label>
                  <input
                    type="text"
                    required
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black font-mono tracking-widest text-center text-lg"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                    placeholder="Enter new password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-[#D4AF37] text-black font-bold py-2 rounded-md hover:bg-[#c4a133] disabled:opacity-50"
                >
                  {forgotLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
