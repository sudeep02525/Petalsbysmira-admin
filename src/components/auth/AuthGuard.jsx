"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

const emptySubscribe = () => () => {};

export default function AuthGuard({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const router = useRouter();
  const pathname = usePathname();

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
