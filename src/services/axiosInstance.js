import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Get the zustand store state from localStorage
      const authStorage = localStorage.getItem("admin-auth-storage");
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const token = parsed?.state?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.error("Failed to parse auth token", e);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin-auth-storage");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
