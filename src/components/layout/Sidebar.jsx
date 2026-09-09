"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, Settings, LogOut, Moon, Sun, X, Tags } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Access Requests", href: "/requests", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 h-[100dvh] bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 shadow-sm transition-transform duration-300 md:relative md:translate-x-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex justify-between items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            <img src="/logo.jpg" alt="Petals by Smira" className="h-10 w-auto rounded-md object-contain shadow-sm transition-transform group-hover:scale-105" />
            <span className="text-xl font-bold font-serif tracking-tight text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              Petals by Smira
            </span>
          </Link>
          <button className="md:hidden text-gray-500 dark:text-gray-400" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-sm text-sm font-medium transition-all ${
                  isActive
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon
                  className={`flex-shrink-0 mr-3 h-5 w-5 ${
                    isActive ? "text-white dark:text-black" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
          
          {/* Theme Segmented Control */}
          <div className="flex bg-gray-100 dark:bg-[#1a1a1a] p-1 rounded-sm border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                if (isDarkMode) toggleDarkMode();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-all ${
                !isDarkMode 
                  ? "bg-white text-black shadow-sm" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Sun className="w-3 h-3" /> Light
            </button>
            <button
              onClick={() => {
                if (!isDarkMode) toggleDarkMode();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-all ${
                isDarkMode 
                  ? "bg-black text-white shadow-sm ring-1 ring-gray-700" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Moon className="w-3 h-3" /> Dark
            </button>
          </div>

          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2.5 rounded-sm text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white transition-colors"
          >
            <LogOut className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
