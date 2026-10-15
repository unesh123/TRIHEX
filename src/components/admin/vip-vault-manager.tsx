"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Crown,
  Sparkles,
  ShieldAlert,
  Zap,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  MessageSquare,
  Lock,
  Layers,
  Terminal,
  Activity,
} from "lucide-react";
import { VipVaultItem } from "@/lib/vip/vip-store";

interface VipVaultManagerProps {
  initialItems: VipVaultItem[];
}

export function VipVaultManager({ initialItems }: VipVaultManagerProps) {
  const [items, setItems] = useState<VipVaultItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VipVaultItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New item form state
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<VipVaultItem["category"]>("VIP ACCESS & CHATS");
  const [formTag, setFormTag] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formBoldItems, setFormBoldItems] = useState("");
  const [formStatus, setFormStatus] = useState<VipVaultItem["status"]>("EXCLUSIVE");
  const [formIsWorking, setFormIsWorking] = useState(true);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.boldItems.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "WORKING" && item.isWorking) ||
      (selectedStatus === "MAINTENANCE" && !item.isWorking) ||
      item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = items.filter((i) => i.isWorking).length;
  const maintenanceCount = items.filter((i) => !i.isWorking).length;
  const exclusiveCount = items.filter((i) => i.status === "EXCLUSIVE").length;
  const hotCount = items.filter((i) => i.status === "HOT").length;

  // Toggle working status
  const handleToggleWorking = async (id: string, currentWorking?: boolean) => {
    const newWorking = !(currentWorking ?? true);
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isWorking: newWorking } : i))
    );

    try {
      await fetch("/api/admin/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-working",
          id,
          isWorking: newWorking,
        }),
      });
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  // Toggle status badge
  const handleUpdateStatus = async (id: string, status: VipVaultItem["status"]) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );

    try {
      await fetch("/api/admin/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-status",
          id,
          status,
        }),
      });
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  // Delete item
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this VIP item from the vault?")) {
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      await fetch("/api/admin/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
    } catch (e) {
      console.error("Failed to delete item", e);
    }
  };

  // Handle Add Item Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSummary) return;

    setIsSubmitting(true);
    const bullets = formBoldItems
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const newItemPayload = {
      title: formTitle,
      category: formCategory,
      tag: formTag || "EXCLUSIVE ASSET",
      summary: formSummary,
      boldItems: bullets.length > 0 ? bullets : [formSummary],
      status: formStatus,
      isWorking: formIsWorking,
    };

    try {
      const res = await fetch("/api/admin/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", item: newItemPayload }),
      });
      const data = await res.json();
      if (data.success && data.item) {
        setItems((prev) => [data.item, ...prev]);
        setIsAddModalOpen(false);
        // Reset form
        setFormTitle("");
        setFormTag("");
        setFormSummary("");
        setFormBoldItems("");
      }
    } catch (err) {
      console.error("Error creating item", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-amber-500/20 bg-slate-900/80 p-4 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-400 font-medium">
            <span>VIP Balls &amp; Perks</span>
            <Crown className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {items.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Launched by Trix Roster
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-4 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
            <span>Active &amp; Working</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {activeCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            100% operational status
          </p>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-slate-900/80 p-4 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between text-xs text-rose-400 font-medium">
            <span>Hot &amp; Unlimited</span>
            <Zap className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {hotCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Lovable &amp; Flux methods
          </p>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-slate-900/80 p-4 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between text-xs text-purple-400 font-medium">
            <span>Exclusive Access</span>
            <Lock className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
            {exclusiveCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Private chat rooms &amp; bots
          </p>
        </div>
      </div>

      {/* 2. Action Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search VIP balls, methods, chatrooms, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="VIP ACCESS & CHATS">VIP Access &amp; Chats</option>
            <option value="CYBERSECURITY & DEFENSE">Cybersecurity &amp; Defense</option>
            <option value="AI & CREATIVE">AI &amp; Creative</option>
            <option value="AUTOMATION & SYSTEMS">Automation &amp; Systems</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="WORKING">Working (Live)</option>
            <option value="MAINTENANCE">Maintenance / Off</option>
            <option value="HOT">HOT</option>
            <option value="EXCLUSIVE">EXCLUSIVE</option>
            <option value="VERIFIED">VERIFIED</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/vip"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View Live Storefront</span>
          </Link>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-md transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add VIP Ball / Resource</span>
          </button>
        </div>
      </div>

      {/* 3. Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-12 text-center text-slate-400">
            <ShieldAlert className="mx-auto h-8 w-8 text-slate-500 mb-2" />
            <p className="text-sm font-semibold">No VIP items found matching your filters.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the filters or add a new VIP ball.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 transition-all duration-200 ${
                item.isWorking
                  ? "border-white/10 bg-slate-900/70 hover:border-amber-500/30"
                  : "border-red-500/20 bg-slate-950/60 opacity-75"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Left content */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      #{item.number}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {item.category}
                    </span>
                    <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
                      {item.tag}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        item.status === "HOT"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : item.status === "EXCLUSIVE"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {item.status}
                    </span>

                    {/* Operational Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        item.isWorking
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.isWorking ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                        }`}
                      />
                      {item.isWorking ? "WORKING / ACTIVE" : "MAINTENANCE / OFF"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{item.title}</span>
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                    {item.summary}
                  </p>

                  {/* Bold Items List preview */}
                  <div className="mt-3 rounded-xl border border-white/5 bg-slate-950/60 p-3.5 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 font-bold block">
                      ⚡ TRIX TV VIP BOLD LIST SPECIFICATION:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {item.boldItems.map((bullet, idx) => {
                        const parts = bullet.split(":");
                        return (
                          <div key={idx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-amber-400 text-xs mt-0.5 font-bold">✔</span>
                            <span className="text-[11px] leading-snug">
                              {parts.length > 1 ? (
                                <>
                                  <strong className="text-white font-semibold">{parts[0]}:</strong>
                                  <span className="text-slate-400">{parts.slice(1).join(":")}</span>
                                </>
                              ) : (
                                <strong className="text-white font-semibold">{bullet}</strong>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex sm:flex-col items-center gap-2 shrink-0">
                  {/* Quick Working Toggle */}
                  <button
                    onClick={() => handleToggleWorking(item.id, item.isWorking)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      item.isWorking
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                    }`}
                  >
                    <Activity className="h-3 w-3" />
                    <span>{item.isWorking ? "Disable" : "Enable"}</span>
                  </button>

                  {/* Status Dropdown */}
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdateStatus(item.id, e.target.value as any)}
                    className="rounded-xl border border-white/10 bg-slate-950 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 focus:border-amber-500/50"
                  >
                    <option value="EXCLUSIVE">EXCLUSIVE</option>
                    <option value="HOT">HOT</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-xl border border-white/10 bg-slate-950/60 p-2 text-slate-400 hover:border-red-500/40 hover:text-red-400 transition"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Add VIP Ball Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-amber-500/30 bg-slate-900 p-6 sm:p-8 text-slate-100 shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Crown className="h-6 w-6 text-amber-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Add New VIP Ball / Method</h2>
                <p className="text-xs text-slate-400">
                  Adds an exclusive perk to the Launched by Trix VIP Vault.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cursor Unlimited Enterprise Agent Setup"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="VIP ACCESS & CHATS">VIP ACCESS &amp; CHATS</option>
                    <option value="CYBERSECURITY & DEFENSE">CYBERSECURITY &amp; DEFENSE</option>
                    <option value="AI & CREATIVE">AI &amp; CREATIVE</option>
                    <option value="AUTOMATION & SYSTEMS">AUTOMATION &amp; SYSTEMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tag Pill
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UNLIMITED METHOD"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Summary Description
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detailed explanation of the perk, blueprint, or access."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bold List Bullets (1 per line, format: Header: Description)
                </label>
                <textarea
                  rows={4}
                  placeholder={`Zero Token Limits: Multi-agent continuous coding cycles\nSupabase Auto-Sync: Direct migrations and auth scaffolding\nGit Sync: Clean commit export to GitHub\n24/7 Trix Channel: Direct Telegram priority line`}
                  value={formBoldItems}
                  onChange={(e) => setFormBoldItems(e.target.value)}
                  className="w-full font-mono rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="EXCLUSIVE">EXCLUSIVE</option>
                    <option value="HOT">HOT</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="ACTIVE">ACTIVE</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isWorkingCheck"
                    checked={formIsWorking}
                    onChange={(e) => setFormIsWorking(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="isWorkingCheck" className="text-xs font-semibold text-slate-200">
                    Is Currently Working / Operational
                  </label>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Publish to VIP Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
