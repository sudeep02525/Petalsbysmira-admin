"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Megaphone, LogOut, Moon, Sun, X } from "lucide-react";
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
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Products", href: "/products", icon: Package },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "Customers", href: "/customers", icon: Users },
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
            <img src="https://res.cloudinary.com/tbllydoh/image/upload/v1787316465/WhatsApp_Image_2026-08-21_at_6.01.28_PM.jpg" alt="Petals by Smira" className="h-8 w-8 rounded-md object-cover shadow-sm transition-transform group-hover:scale-105" />
            <span className="text-xl font-bold font-serif tracking-tight text-gray-900 dark:text-white group-hover:text-[#D4AF37] transition-colors">
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
                className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 dark:bg-[#111] text-black dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#111] hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon
                  className={`flex-shrink-0 mr-3 h-5 w-5 ${
                    isActive ? "text-black dark:text-white" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions (Dark Mode & Logout) */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
          
          {/* Theme Segmented Control */}
          <div className="flex bg-gray-100 dark:bg-[#111] p-1 rounded-lg">
            <button
              onClick={() => {
                if (isDarkMode) toggleDarkMode();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                !isDarkMode 
                  ? "bg-white text-black shadow-sm" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
            <button
              onClick={() => {
                if (!isDarkMode) toggleDarkMode();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
                isDarkMode 
                  ? "bg-black text-white shadow-sm ring-1 ring-gray-800" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
