"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Bell, Tag, ShoppingBag, Eye } from "lucide-react";
import { PersonalizedRecommendation } from "@/lib/personalization/user-intent";
import { WatchlistAlert } from "@/lib/watchlist/types";

export function ReturningUserFeed() {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [alerts, setAlerts] = useState<WatchlistAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const guestId = localStorage.getItem("trihex_guest_id") || "guest";
      const rawRecent = localStorage.getItem("trihex_recently_viewed");
      const recentSlugs: string[] = rawRecent ? JSON.parse(rawRecent) : [];

      // Fetch recommendations
      fetch("/api/personalization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recentProductSlugs: recentSlugs,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.recommendations) {
            setRecommendations(data.recommendations);
          }
        })
        .catch(() => {});

      // Fetch active watchlist alerts
      fetch(`/api/watchlist?userId=${encodeURIComponent(guestId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.alerts) {
            setAlerts(data.alerts);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, []);

  if (loading || (recommendations.length === 0 && alerts.length === 0)) {
    return null;
  }

  return (
    <section aria-label="Personalized Recommendations" className="py-8 border-b border-slate-800/60 bg-slate-950/30">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Personalized for Your Workflow</h2>
              <p className="text-xs text-slate-400">Curated based on your browsing patterns and saved alerts</p>
            </div>
          </div>

          <Link
            href="/account/saved"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Manage Watchlist & Saved
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Watchlist Alerts Banner (if user has active alerts) */}
        {alerts.length > 0 && (
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <Bell className="h-4 w-4 shrink-0" />
              <span>You have <strong className="text-white">{alerts.length} active watchlist alerts</strong> (monitoring forex & product prices)</span>
            </div>
            <Link
              href="/account/saved"
              className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-[11px] font-semibold transition-colors"
            >
              View Active Alerts
            </Link>
          </div>
        )}

        {/* Recommendations Cards - strictly 1 col on < 640px */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((rec, i) => (
            <Link
              key={i}
              href={rec.url}
              className="group flex flex-col justify-between p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {rec.badge}
                  </span>
                  {rec.priceOrValue && (
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {rec.priceOrValue}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {rec.subtitle}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="italic">{rec.reason}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  View <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
