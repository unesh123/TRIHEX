"use client";

import { useState } from "react";
import Link from "next/link";
import {
  VAULT_ITEMS,
  type VaultCategory,
  type VaultItem,
} from "@/lib/catalog/vault-items";
import { SilentTaxCalculator } from "@/components/vault/silent-tax-calculator";
import {
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  Download,
  ExternalLink,
  CheckCircle2,
  Search,
  Sparkles,
  FileText,
  Gift,
  Flame,
} from "lucide-react";

const CATEGORIES: { id: VaultCategory; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All Classifieds", icon: <Flame className="h-4 w-4" /> },
  { id: "vip-bundles", label: "VIP Vault Bundles", icon: <Lock className="h-4 w-4 text-emerald-400" /> },
  { id: "developer-perks", label: "Free Developer Perks", icon: <Gift className="h-4 w-4 text-cyan-400" /> },
  { id: "public-records", label: "Public Court Dockets", icon: <FileText className="h-4 w-4 text-amber-400" /> },
  { id: "interactive-tools", label: "The Silent Tax Tool", icon: <Sparkles className="h-4 w-4 text-purple-400" /> },
];

export function VaultHub() {
  const [selectedCategory, setSelectedCategory] = useState<VaultCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = VAULT_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Search & Category Filter Navigation */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vault archives, prompts, perks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Show Silent Tax Calculator if selected or in 'all' view */}
      {(selectedCategory === "all" || selectedCategory === "interactive-tools") && (
        <section className="animate-in fade-in duration-300">
          <SilentTaxCalculator />
        </section>
      )}

      {/* Vault Items Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-blue-600" />
            <span>Classified Drops &amp; Developer Assets ({filteredItems.length})</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Encrypted Repositories • Nepal First Checkout
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500 text-sm">
            No vault resources matched &ldquo;{searchQuery}&rdquo;. Try another keyword.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems
              .filter((item) => item.type !== "INTERACTIVE_TOOL")
              .map((item) => (
                <VaultCard key={item.id} item={item} />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

function VaultCard({ item }: { item: VaultItem }) {
  const isPaid = item.type === "PAID_BUNDLE";
  const isFreePerk = item.type === "FREE_PERK";
  const isPublicRecord = item.type === "PUBLIC_RECORD";
  const isExpired = item.status === "EXPIRED";

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
        isExpired
          ? "border-slate-200 bg-slate-50/70 opacity-80"
          : "border-slate-200/80 bg-white hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl"
      }`}
    >
      {/* Top badges */}
      <div>
        <div className="flex items-center justify-between gap-2">
          {isExpired ? (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-red-800 border border-red-200">
              Expired Promotion ({item.validUntil ?? "Past Campaign"})
            </span>
          ) : (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                isPaid
                  ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                  : isFreePerk
                  ? "bg-cyan-500/10 text-cyan-700 border border-cyan-500/20"
                  : "bg-amber-500/10 text-amber-700 border border-amber-500/20"
              }`}
            >
              {item.classificationBadge}
            </span>
          )}
          <span className="font-mono text-[10px] font-semibold text-slate-400">
            {item.fileSize}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`mt-3 text-base font-extrabold leading-snug transition-colors ${
            isExpired
              ? "text-slate-700"
              : "text-slate-900 group-hover:text-blue-600"
          }`}
        >
          {item.title}
        </h3>

        {/* Short description */}
        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
          {item.shortDescription}
        </p>

        {/* Highlights */}
        <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
          {item.highlights.slice(0, 4).map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
              <span className="line-clamp-2">{h}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer / Actions */}
      <div className="mt-6 border-t border-slate-100 pt-4">
        {/* Pricing / Valuation */}
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">Valuation</div>
            <div className="text-xs text-slate-500 line-through">{item.originalValuation}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase text-slate-400">TRIHEX Access</div>
            <div className="text-base font-black text-slate-900">
              {isExpired ? "CAMPAIGN CLOSED" : isPaid ? `Rs. ${item.priceNpr}` : "FREE CLAIM"}
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isExpired ? (
          <button
            type="button"
            disabled
            className="flex h-10 w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-400"
          >
            <span>Promo Concluded</span>
          </button>
        ) : isPaid ? (
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/products/${item.slug}`}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Unlock Vault</span>
            </Link>
            <a
              href={`https://wa.me/9779702910130?text=${encodeURIComponent(
                `Hi TRIHEX! I want to order the classified vault product: ${item.title} (Rs. ${item.priceNpr}).`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-50 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 active:scale-[0.98]"
            >
              WhatsApp
            </a>
          </div>
        ) : item.downloadUrl ? (
          <a
            href={item.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-900 text-xs font-bold text-white shadow transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <span>{isFreePerk ? "Claim Free Perk Voucher" : "Open Court Docket Archive"}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        ) : null}

        {/* Security badge */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400">
          <Lock className="h-3 w-3 text-slate-400" />
          <span>{item.deliverable}</span>
        </div>
      </div>
    </article>
  );
}
