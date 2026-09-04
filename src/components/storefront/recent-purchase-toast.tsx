"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";

interface PurchaseItem {
  id: string;
  name: string;
  city: string;
  product: string;
  slug: string;
  timeAgo: string;
  tag: string;
}

const BUYERS = [
  "Rohan S.", "Pooja T.", "Aarav K.", "Bikash M.", "Sneha D.",
  "Prashant R.", "Ankit B.", "Nisha S.", "Saurav P.", "Kritika M.",
  "Dipesh G.", "Bibek T.", "Ashish N.", "Priya B.", "Sandesh K.",
  "Manish D.", "Ujjwal S.", "Rupa K.", "Suman J.", "Ayush B.",
  "Rabina K.", "Pradeep S.", "Shristi A.", "Nabin T.", "Roshani P."
];

const CITIES = [
  "Kathmandu", "Pokhara", "Lalitpur", "Biratnagar", "Butwal",
  "Dharan", "Chitwan", "Bhaktapur", "Itahari", "Hetauda",
  "Nepalgunj", "Birgunj", "Birtamode", "Janakpur", "Dhangadhi", "Banepa"
];

const PRODUCTS: { product: string; slug: string; tag: string }[] = [
  { product: "ChatGPT Plus Dedicated", slug: "chatgpt-plus-1-month-fw", tag: "AI Assistant" },
  { product: "Cursor Pro 12M Annual", slug: "cursor-pro-12m", tag: "AI Coding" },
  { product: "Claude Code API Access", slug: "claude-code-api-access", tag: "Developer" },
  { product: "Google AI Pro 5TB", slug: "gemini-pro-18-months-link", tag: "Best Value" },
  { product: "ElevenLabs Creator Voice", slug: "elevenlabs-creator-shared", tag: "Voice AI" },
  { product: "Manus AI Pro Agent", slug: "manus-ai-pro-12m", tag: "Autonomous" },
  { product: "Canva Pro 1-Year License", slug: "canva-pro-1-year", tag: "Design" },
  { product: "CapCut Pro Video Suite", slug: "capcut-pro", tag: "Video" },
  { product: "Gamma Pro Presentation", slug: "gamma-pro-1-year", tag: "Slide AI" },
  { product: "Supabase Pro 1-Year", slug: "supabase-pro-1-year", tag: "Cloud DB" },
  { product: "Lovable AI Pro Builder", slug: "lovable-pro-12m", tag: "App Builder" },
  { product: "Runway Gen-3 Pro", slug: "runway-pro-12m", tag: "Video Gen" },
  { product: "Kling AI Ultra Studio", slug: "kling-ultra-26k-credits", tag: "Filmmaking" },
  { product: "Udemy 16 AI Agent Pack", slug: "udemy-16-developer-ai-agent-pack", tag: "Developer" },
  { product: "AI Money Maker Vault Course", slug: "ai-money-maker-digital-course-2026", tag: "Vault Drop" },
  { product: "The Psychology of Closing Bundle", slug: "the-psychology-of-closing-bundle", tag: "Sales Vault" },
  { product: "The Passive Rebel (Leads Engine)", slug: "the-passive-rebel-antisocial-leads", tag: "Acquisition" },
  { product: "SuperGrok 3-Month Plan", slug: "supergrok-3-months", tag: "Deep Reasoning" },
];

const TIMES = ["Just now", "1m ago", "2m ago", "4m ago", "6m ago", "9m ago", "12m ago", "18m ago"];

/**
 * Deterministically generates a pool of 100+ unique recent purchase notifications
 */
function generateNotificationPool(): PurchaseItem[] {
  const pool: PurchaseItem[] = [];
  let id = 1;
  for (let i = 0; i < BUYERS.length; i++) {
    for (let j = 0; j < PRODUCTS.length; j++) {
      const city = CITIES[(i + j) % CITIES.length];
      const timeAgo = TIMES[(i * 3 + j) % TIMES.length];
      const prod = PRODUCTS[j];
      pool.push({
        id: `np-${id++}`,
        name: BUYERS[i],
        city,
        product: prod.product,
        slug: prod.slug,
        timeAgo,
        tag: prod.tag,
      });
      if (pool.length >= 120) return pool;
    }
  }
  return pool;
}

const NOTIFICATION_POOL = generateNotificationPool();

export function RecentPurchaseToast() {
  const [current, setCurrent] = useState<PurchaseItem | null>(null);
  const [visible, setVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (isDismissed) return;

    let index = Math.floor(Math.random() * NOTIFICATION_POOL.length);
    let hideTimer: NodeJS.Timeout;

    // Show initial toast after 4.5 seconds
    const initialTimer = setTimeout(() => {
      startTransition(() => {
        setCurrent(NOTIFICATION_POOL[index]);
        setVisible(true);
      });

      // Auto-hide after 6 seconds
      hideTimer = setTimeout(() => {
        setVisible(false);
      }, 6000);
    }, 4500);

    // Set recurring rotation interval (every 18 seconds)
    const intervalTimer = setInterval(() => {
      index = (index + 1) % NOTIFICATION_POOL.length;
      startTransition(() => {
        setCurrent(NOTIFICATION_POOL[index]);
        setVisible(true);
      });

      hideTimer = setTimeout(() => {
        setVisible(false);
      }, 6000);
    }, 18000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(hideTimer);
      clearInterval(intervalTimer);
    };
  }, [isDismissed]);

  if (!current || !visible) return null;

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
            <span className="truncate">{current.city}, NP</span>
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
