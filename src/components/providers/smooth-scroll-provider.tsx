"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * Robust scroll provider that guarantees 100% native, unhindered browser scrolling.
 * Eliminates wheel interception, touch blocking, and virtual scroll desync on long pages.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Instantly reset scroll to top on route change without blocking native scroll behavior
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return <>{children}</>;
}
