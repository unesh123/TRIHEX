"use client";

import { useState, useEffect } from "react";
import {
  Radio,
  RefreshCw,
  TrendingUp,
  Activity,
  Wind,
  Zap,
  Crown,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface LiveBoardMetrics {
  ordersCount?: number;
  membersCount?: number;
  vaultCount?: number;
}

export function AdminLiveEngineBanner() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastScrapeTime, setLastScrapeTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<LiveBoardMetrics>({
    ordersCount: 0,
    membersCount: 0,
    vaultCount: 0,
  });

  const triggerLiveScrape = async () => {
    setIsRunning(true);
    setStatusMessage("Executing full 24/7 autonomous live scrape scan...");
    try {
      const res = await fetch("/api/admin/live-scrape", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMetrics({
          ordersCount: data.results?.vipOrders?.count ?? 0,
          membersCount: data.results?.vipMembers?.count ?? 0,
          vaultCount: data.results?.vipVault?.count ?? 0,
        });
        setLastScrapeTime(new Date().toLocaleTimeString());
        setStatusMessage(`Scrape cycle complete (${data.durationMs}ms) — All 24/7 boards synchronized.`);
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setStatusMessage(`Scrape scan issue: ${data.error || "Unknown"}`);
      }
    } catch (err: any) {
      console.error("Scrape scan error:", err);
      setStatusMessage("Network error triggering scrape scan.");
    } finally {
      setIsRunning(false);
    }
  };

  // Background polling every 20s
  useEffect(() => {
    const fetchLatestStatus = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch("/api/admin/live-scrape");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.boards) {
            setMetrics({
              ordersCount: data.boards.vipOrders?.count ?? 0,
              membersCount: data.boards.vipMembers?.count ?? 0,
              vaultCount: data.boards.vipVault?.count ?? 0,
            });
            setLastScrapeTime(new Date().toLocaleTimeString());
          }
        }
      } catch (e) {
        // Silently retry
      }
    };

    const timer = setInterval(fetchLatestStatus, 20000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 shadow-xl text-white">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
            <Radio className="h-5 w-5 animate-pulse text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                24/7 Autonomous Live Scraping Engine &amp; Data Pipeline
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live background polling across NRB Forex, USGS Seismic, Nepal AQI, Deal Radar &amp; VIP Boards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Last Pulse: {lastScrapeTime}
          </span>
          <button
            onClick={triggerLiveScrape}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black shadow-md hover:from-emerald-400 hover:to-teal-400 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRunning ? "animate-spin text-slate-950" : ""}`} />
            <span>{isRunning ? "Scraping Feeds..." : "Run Live Scrape Now"}</span>
          </button>
        </div>
      </div>

      {/* Success/Status Alert */}
      {statusMessage && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 5-Node Status Matrix */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Node 1: NRB Forex */}
        <div className="rounded-xl border border-amber-500/20 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> NRB Forex
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          </div>
          <div className="text-xs font-mono font-bold text-white">Live Scraping (24/7)</div>
          <div className="text-[10px] text-slate-400 mt-0.5">USD / EUR / GBP / INR</div>
        </div>

        {/* Node 2: USGS Seismic */}
        <div className="rounded-xl border border-rose-500/20 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between text-xs text-rose-400 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> USGS Seismic
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          </div>
          <div className="text-xs font-mono font-bold text-white">Real-Time Geodetic</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Himalayan Tremor Radar</div>
        </div>

        {/* Node 3: Nepal AQI */}
        <div className="rounded-xl border border-cyan-500/20 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5" /> Nepal AQI
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          </div>
          <div className="text-xs font-mono font-bold text-white">Atmospheric Stream</div>
          <div className="text-[10px] text-slate-400 mt-0.5">KTM &amp; Pokhara PM2.5</div>
        </div>

        {/* Node 4: Deal Radar */}
        <div className="rounded-xl border border-indigo-500/20 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Deal Radar
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          </div>
          <div className="text-xs font-mono font-bold text-white">Autonomous Perks</div>
          <div className="text-[10px] text-slate-400 mt-0.5">8+ Cloud Ecosystems</div>
        </div>

        {/* Node 5: VIP 3-Board Feeder */}
        <div className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-3 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5" /> VIP 3-Board
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-xs font-mono font-bold text-white">Live Radar Active</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Orders · Roster · Vault</div>
        </div>
      </div>
    </div>
  );
}
