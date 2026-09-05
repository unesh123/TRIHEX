"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";

export interface SocialProofEvent {
  id: string;
  name: string;
  city: string;
  product: string;
  slug: string;
  timeAgo: string;
  tag: string;
}

const SUPPRESSED_ROUTES = [
  "/vault",
  "/deals",
  "/cart",
  "/map",
  "/nepal/research",
  "/research",
  "/track-order",
];

const SUPPRESSED_PREFIXES = [
  "/vault",
  "/prompts",
  "/skills",
  "/admin",
  "/checkout",
  "/orders",
];

export function isRouteSuppressed(pathname: string | null): boolean {
  if (!pathname) return false;
  if (SUPPRESSED_ROUTES.includes(pathname)) return true;
  for (const prefix of SUPPRESSED_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

export function RecentPurchaseToast() {
  const pathname = usePathname();
  const suppressed = useMemo(() => isRouteSuppressed(pathname), [pathname]);

  const [events, setEvents] = useState<SocialProofEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<SocialProofEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [, startTransition] = useTransition();

  // Load orders only if current route is not suppressed
  useEffect(() => {
    if (suppressed) return;

    let isMounted = true;

    async function fetchRecentOrders() {
      try {
        const res = await fetch("/api/social-proof/recent");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.ok && Array.isArray(data.events) && data.events.length > 0) {
          // Filter out events already seen in this session
          try {
            const rawSeen = sessionStorage.getItem("seenSocialProofEventIds");
            const seenIds: string[] = rawSeen ? JSON.parse(rawSeen) : [];
            const unseen = data.events.filter((e: SocialProofEvent) => !seenIds.includes(e.id));
            setEvents(unseen);
          } catch {
            setEvents(data.events);
          }
        }
      } catch {
        // Silently omit toast on network error
      }
    }

    fetchRecentOrders();

    return () => {
      isMounted = false;
    };
  }, [suppressed]);

  // Handle toast cycle and deduplication
  useEffect(() => {
    if (suppressed || isDismissed || events.length === 0) {
      setVisible(false);
      return;
    }

    let hideTimer: NodeJS.Timeout;
    let eventIndex = 0;

    // Pick first unseen event
    const initialTimer = setTimeout(() => {
      const nextEvt = events[eventIndex];
      if (!nextEvt) return;

      // Mark event as seen in sessionStorage
      try {
        const rawSeen = sessionStorage.getItem("seenSocialProofEventIds");
        const seenIds: string[] = rawSeen ? JSON.parse(rawSeen) : [];
        if (!seenIds.includes(nextEvt.id)) {
          seenIds.push(nextEvt.id);
          sessionStorage.setItem("seenSocialProofEventIds", JSON.stringify(seenIds.slice(-50)));
        }
      } catch {
        // Ignore sessionStorage restrictions
      }

      setCurrentEvent(nextEvt);
      startTransition(() => {
        setVisible(true);
      });

      hideTimer = setTimeout(() => {
        setVisible(false);
      }, 6000);
    }, 5000);

    // Rotate through remaining unseen events every 24s
    const intervalTimer = setInterval(() => {
      eventIndex++;
      if (eventIndex >= events.length) {
        // All unique events exhausted for this session — stop toast
        clearInterval(intervalTimer);
        setVisible(false);
        return;
      }

      const nextEvt = events[eventIndex];
      if (!nextEvt) return;

      try {
        const rawSeen = sessionStorage.getItem("seenSocialProofEventIds");
        const seenIds: string[] = rawSeen ? JSON.parse(rawSeen) : [];
        if (!seenIds.includes(nextEvt.id)) {
          seenIds.push(nextEvt.id);
          sessionStorage.setItem("seenSocialProofEventIds", JSON.stringify(seenIds.slice(-50)));
        }
      } catch {
        // Ignore sessionStorage errors
      }

      setCurrentEvent(nextEvt);
      startTransition(() => {
        setVisible(true);
      });

      hideTimer = setTimeout(() => {
        setVisible(false);
      }, 6000);
    }, 24000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(hideTimer);
      clearInterval(intervalTimer);
    };
  }, [events, suppressed, isDismissed]);

  // Strictly return null if suppressed, dismissed, not visible, or no current event
  if (suppressed || events.length === 0 || !visible || isDismissed || !currentEvent) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-36 left-4 z-40 max-w-[340px] animate-in fade-in slide-in-from-bottom-5 duration-300 lg:bottom-22 lg:left-6 sm:max-w-[360px]"
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
            <span className="truncate">{currentEvent.city}</span>
            <span>•</span>
            <span className="text-slate-400 shrink-0">{currentEvent.timeAgo}</span>
          </div>

          <p className="mt-0.5 text-xs text-slate-700 leading-snug">
            <span className="font-bold text-slate-900">{currentEvent.name}</span> purchased
          </p>

          <Link
            href={`/products/${currentEvent.slug}`}
            className="mt-0.5 block truncate text-xs font-black text-blue-600 hover:text-blue-700 hover:underline"
          >
            {currentEvent.product}
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
