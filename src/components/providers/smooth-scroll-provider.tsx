"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { ChevronUp } from "lucide-react";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * Ultimate Luxury Smooth Scroll Provider
 * Engineered for silky, momentum-based inertial scrolling with zero lockups or touch conflicts.
 * Features:
 * - Exponential deceleration curve (Apple/Linear-grade fluid glide)
 * - Dynamic ResizeObserver auto-synchronization for zero bottom-clipping
 * - Top glowing progress indicator tracking scroll progress
 * - Glassmorphic floating Back-to-Top pill button
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    // Respect user's accessibility reduced motion setting
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    // Initialize Lenis with luxury deceleration curve
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.05,
      syncTouch: false, // Does not hijack mobile touch physics
      touchMultiplier: 1.0,
      autoResize: true,
      infinite: false,
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis;

    // Listen to scroll events for progress bar & back-to-top button
    lenis.on("scroll", (e: { progress: number; scroll: number }) => {
      setScrollProgress(Math.min(100, Math.max(0, e.progress * 100)));
      setShowBackToTop(e.scroll > 450);
    });

    // Continuous requestAnimationFrame loop
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Auto-recalculate scroll boundaries when dynamic components mutate or load
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        lenis.resize();
      });
      resizeObserver.observe(document.body);
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      lenis.destroy();
      lenisRef.current = null;
      (window as any).lenis = null;
    };
  }, []);

  // Reset scroll and re-sync bounds on route changes
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      lenisRef.current.resize();
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    setScrollProgress(0);
    setShowBackToTop(false);
  }, [pathname]);

  const handleScrollToTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.1 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Top Luxury Ambient Scroll Progress Glow Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[2.5px] z-[120] pointer-events-none transition-all duration-75"
        style={{
          width: `${scrollProgress}%`,
          background: "linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #10b981 100%)",
          boxShadow: scrollProgress > 1 ? "0 0 10px rgba(6, 182, 212, 0.7), 0 0 4px rgba(59, 130, 246, 0.8)" : "none",
        }}
        aria-hidden="true"
      />

      {children}

      {/* Floating Glassmorphic Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-900/85 px-3 py-2 text-xs font-semibold text-slate-200 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white animate-in fade-in slide-in-from-bottom-3"
          aria-label="Scroll back to top"
        >
          <ChevronUp className="h-4 w-4 text-cyan-400" />
          <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider">Top</span>
        </button>
      )}
    </>
  );
}
