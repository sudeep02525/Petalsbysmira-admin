"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AuthGuard from "../auth/AuthGuard";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoginPage) {
    return <main>{children}</main>;
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
