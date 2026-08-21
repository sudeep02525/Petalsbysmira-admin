"use client";

import { useAuthStore } from "../../store/authStore";
import { LogOut, User, Menu } from "lucide-react";

export default function Topbar({ toggleSidebar }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 transition-colors">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 mr-3 -ml-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="font-medium hidden sm:block">{user?.name || "Admin"}</span>
        </div>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
