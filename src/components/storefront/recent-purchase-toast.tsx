"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";

interface SocialProofEvent {
  id: string;
  name: string;
  city: string;
  product: string;
  slug: string;
  timeAgo: string;
  tag: string;
}

export function RecentPurchaseToast() {
  const [events, setEvents] = useState<SocialProofEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    async function fetchRecentOrders() {
      try {
        const res = await fetch("/api/social-proof/recent");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.ok && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
        }
      } catch {
        // Silently omit toast on network error
      }
    }

    fetchRecentOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isDismissed || events.length === 0) return;

    let hideTimer: NodeJS.Timeout;

    // Show initial toast after 5 seconds if we have real events
    const initialTimer = setTimeout(() => {
      startTransition(() => {
        setVisible(true);
      });

      hideTimer = setTimeout(() => {
        setVisible(false);
      }, 6000);
    }, 5000);

    // Rotate through real orders every 22 seconds
    const intervalTimer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
      startTransition(() => {
        setVisible(true);
      });

      hideTimer = setTimeout(() => {
        setVisible(false);
      }, 6000);
    }, 22000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(hideTimer);
      clearInterval(intervalTimer);
    };
  }, [events, isDismissed]);

  // Strictly return null if no real completed orders exist or dismissed
  if (events.length === 0 || !visible || isDismissed) {
    return null;
  }

  const current = events[currentIndex];
  if (!current) return null;

  return (
    <aside
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-20 left-4 z-40 max-w-[340px] animate-in fade-in slide-in-from-bottom-5 duration-300 sm:bottom-6 sm:left-6 sm:max-w-[360px]"
    >
      <div className="group relative flex items-start gap-3 rounded-2xl border border-blue-200/80 bg-white/95 p-3.5 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all hover:border-blue-400">
        {/* Glowing badge icon */}
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/25">
          <ShoppingBag className="h-5 w-5 text-white" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border border-white" />
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
              <CheckCircle2 className="h-3 w-3" />
              Verified Order
            </span>
            <span>•</span>
            <span className="truncate">{current.city}</span>
            <span>•</span>
            <span className="text-slate-400 shrink-0">{current.timeAgo}</span>
          </div>

          <p className="mt-0.5 text-xs text-slate-700 leading-snug">
            <span className="font-bold text-slate-900">{current.name}</span> purchased
          </p>

          <Link
            href={`/products/${current.slug}`}
            className="mt-0.5 block truncate text-xs font-black text-blue-600 hover:text-blue-700 hover:underline"
          >
            {current.product}
          </Link>
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setIsDismissed(true);
          }}
          className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
