"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bookmark, 
  Trash2, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  ShoppingBag, 
  Cpu, 
  ArrowRight,
  Bell,
  Plus,
  Check,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { SavedItem, SavedEntityType } from "@/lib/saved/types";
import { WatchlistAlert } from "@/lib/watchlist/types";

export default function SavedItemsPage() {
  const [activeTab, setActiveTab] = useState<"SAVED" | "WATCHLIST">("SAVED");
  const [items, setItems] = useState<SavedItem[]>([]);
  const [alerts, setAlerts] = useState<WatchlistAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"ALL" | SavedEntityType>("ALL");

  // Forex alert modal/form state
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [alertCurrency, setAlertCurrency] = useState("USD");
  const [alertCondition, setAlertCondition] = useState<"RATE_ABOVE" | "RATE_BELOW">("RATE_ABOVE");
  const [alertTarget, setAlertTarget] = useState("135.50");
  const [submittingAlert, setSubmittingAlert] = useState(false);

  useEffect(() => {
    const guestId = localStorage.getItem("trihex_guest_id") || "guest";

    Promise.all([
      fetch(`/api/saved?userId=${encodeURIComponent(guestId)}`)
        .then((res) => res.json())
        .catch(() => ({ items: [] })),
      fetch(`/api/watchlist?userId=${encodeURIComponent(guestId)}`)
        .then((res) => res.json())
        .catch(() => ({ alerts: [] })),
    ])
      .then(([savedData, watchData]) => {
        if (savedData.items) setItems(savedData.items);
        if (watchData.alerts) setAlerts(watchData.alerts);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (item: SavedItem) => {
    const guestId = localStorage.getItem("trihex_guest_id") || "guest";

    // Optimistic removal
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    try {
      await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: guestId,
          entityType: item.entityType,
          entityId: item.entityId,
        }),
      });
    } catch {
      setItems((prev) => [item, ...prev]);
    }
  };

  const handleToggleAlert = async (alert: WatchlistAlert) => {
    const guestId = localStorage.getItem("trihex_guest_id") || "guest";
    const nextState = !alert.enabled;

    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, enabled: nextState } : a))
    );

    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          alertId: alert.id,
          enabled: nextState,
          userId: guestId,
        }),
      });
    } catch {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, enabled: !nextState } : a))
      );
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    const guestId = localStorage.getItem("trihex_guest_id") || "guest";
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));

    try {
      await fetch(`/api/watchlist?alertId=${encodeURIComponent(alertId)}&userId=${encodeURIComponent(guestId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete alert:", err);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const guestId = localStorage.getItem("trihex_guest_id") || "guest";
    setSubmittingAlert(true);

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: guestId,
          entityType: "FOREX",
          entityId: alertCurrency,
          condition: alertCondition,
          targetValue: alertTarget,
          channel: "BROWSER",
          label: `${alertCurrency} ${alertCondition === "RATE_ABOVE" ? "≥" : "≤"} Rs. ${alertTarget} Alert`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.alert) {
          setAlerts((prev) => [data.alert, ...prev]);
          setShowAddAlert(false);
        }
      }
    } catch (err) {
      console.error("Failed to create alert:", err);
    } finally {
      setSubmittingAlert(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeFilter === "ALL") return true;
    return item.entityType === activeFilter;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Watchlist &amp; Saved Items</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track bookmarks, monitor forex rate thresholds, and save deals for instant resumption.
          </p>
        </div>

        {/* Primary Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("SAVED")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "SAVED"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Items ({items.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("WATCHLIST")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "WATCHLIST"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Forex Alerts ({alerts.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading your saved library &amp; active watchlists...
        </div>
      ) : activeTab === "WATCHLIST" ? (
        /* WATCHLIST & FOREX ALERTS VIEW */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Active Threshold Alerts</h2>
              <p className="text-xs text-slate-400">Automated monitoring against official Nepal Rastra Bank benchmarks.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAlert(!showAddAlert)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Forex Alert</span>
            </button>
          </div>

          {/* Add Alert Form Drawer */}
          {showAddAlert && (
            <form
              onSubmit={handleCreateAlert}
              className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-4"
            >
              <h3 className="text-xs uppercase tracking-wider font-bold text-amber-400">Configure New Rate Alert</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Currency</label>
                  <select
                    value={alertCurrency}
                    onChange={(e) => setAlertCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Trigger Condition</label>
                  <select
                    value={alertCondition}
                    onChange={(e) => setAlertCondition(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                  >
                    <option value="RATE_ABOVE">Sell Rate Rises At/Above</option>
                    <option value="RATE_BELOW">Buy Rate Drops At/Below</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target NPR Value (Rs.)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={alertTarget}
                    onChange={(e) => setAlertTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAlert(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAlert}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {submittingAlert ? "Saving..." : "Save Alert"}
                </button>
              </div>
            </form>
          )}

          {alerts.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl border border-white/5 bg-slate-900/40">
              <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No active watchlist alerts</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Set a target exchange rate alert for USD, EUR, or GBP to get notified when rates move.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    alert.enabled
                      ? "bg-slate-900/80 border-amber-500/30 shadow-sm"
                      : "bg-slate-950 border-white/5 opacity-60"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {alert.entityId}
                      </span>
                      <span className="text-xs font-semibold text-white flex items-center gap-1">
                        {alert.condition === "RATE_ABOVE" ? (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        {alert.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Channel: <strong className="text-slate-300">{alert.channel}</strong> • Status:{" "}
                      <span className={alert.enabled ? "text-emerald-400" : "text-slate-500"}>
                        {alert.enabled ? "Actively Monitoring" : "Paused"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleAlert(alert)}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        alert.enabled
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          : "bg-amber-600/30 text-amber-300 hover:bg-amber-600/40"
                      }`}
                    >
                      {alert.enabled ? "Pause" : "Resume"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* SAVED ITEMS VIEW */
        <div>
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-white/5 scrollbar-none">
            {(["ALL", "PRODUCT", "DEAL", "PROMPT", "SKILL"] as const).map((filter) => {
              const active = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-white/5"
                  }`}
                >
                  {filter === "ALL" ? "All Saved" : `${filter}s`}
                </button>
              );
            })}
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-20 px-4 rounded-2xl border border-white/5 bg-slate-900/40">
              <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-semibold text-white">No items in your watchlist</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Bookmark products, deals, and prompts using the bookmark icon across our catalog.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/products"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm"
                >
                  Browse Storefront
                </Link>
                <Link
                  href="/deals"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
                >
                  Explore Deals
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => {
                const meta = item.metadata;
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl border border-white/10 bg-slate-900/80 p-5 hover:border-white/20 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            meta?.badgeColor || "bg-slate-800 text-slate-300 border-white/10"
                          }`}
                        >
                          {meta?.badge || item.entityType}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          title="Remove from saved items"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                          {meta?.title || item.entityId}
                        </h3>
                        {meta?.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {meta.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-slate-300">
                        {meta?.priceOrValue || item.entityType}
                      </span>

                      <Link
                        href={meta?.url || "#"}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
