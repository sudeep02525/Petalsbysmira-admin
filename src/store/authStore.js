import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../services/axiosInstance";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const response = await axiosInstance.post("/admin/login", {
            email,
            password,
          });
          const { token, ...userData } = response.data;
          set({ user: userData, token, isAuthenticated: true });
          return { success: true };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || "Login failed",
          };
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin-auth-storage");
          window.location.href = "/login";
        }
      },
    }),
    {
      name: "admin-auth-storage",
    }
  )
);
