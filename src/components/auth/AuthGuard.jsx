"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

export default function AuthGuard({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [isMounted, isAuthenticated, router, pathname]);

  if (!isMounted) {
    return null; // Wait for hydration
  }

  if (!isAuthenticated && pathname !== "/login") {
    return null;
  }

  return children;
}
