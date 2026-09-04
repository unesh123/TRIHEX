"use client";

import { useState, useMemo } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  Check, 
  X, 
  Search, 
  Clock, 
  Flame, 
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2
} from "lucide-react";
import { DealCandidate, DealApprovalType } from "@/lib/deals/types";

interface DealVerificationQueueProps {
  initialDeals: DealCandidate[];
}

export function DealVerificationQueue({ initialDeals }: DealVerificationQueueProps) {
  const [deals, setDeals] = useState<DealCandidate[]>(initialDeals);
  const [filterTab, setFilterTab] = useState<"NEEDS_REVIEW" | "PUBLISHED" | "REJECTED" | "ALL">("NEEDS_REVIEW");
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Edit modal state
  const [editingDeal, setEditingDeal] = useState<DealCandidate | null>(null);
  const [editPromoCode, setEditPromoCode] = useState("");
  const [editEligibility, setEditEligibility] = useState("");

  const counts = useMemo(() => {
    return {
      needsReview: deals.filter((d) => d.status === "NEEDS_REVIEW" || d.status === "VERIFICATION_REQUIRED" || d.status === "DISCOVERED" || d.status === "VERIFIED").length,
      published: deals.filter((d) => d.status === "PUBLISHED").length,
      rejected: deals.filter((d) => d.status === "REJECTED").length,
      total: deals.length,
    };
  }, [deals]);

  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      if (filterTab === "NEEDS_REVIEW") {
        if (d.status !== "NEEDS_REVIEW" && d.status !== "VERIFICATION_REQUIRED" && d.status !== "DISCOVERED" && d.status !== "VERIFIED") return false;
      } else if (filterTab === "PUBLISHED") {
        if (d.status !== "PUBLISHED") return false;
      } else if (filterTab === "REJECTED") {
        if (d.status !== "REJECTED") return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        return d.title.toLowerCase().includes(q) || d.vendor.toLowerCase().includes(q);
      }

      return true;
    });
  }, [deals, filterTab, search]);

  const handleAction = async (dealId: string, action: "APPROVE" | "REJECT", approvalType?: DealApprovalType) => {
    setProcessingId(dealId);
    try {
      const res = await fetch("/api/admin/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId,
          action,
          approvalType: approvalType || "FREE",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.deal) {
          setDeals((prev) => prev.map((d) => (d.id === dealId ? data.deal : d)));
        }
      }
    } catch (err) {
      console.error("Failed to process queue action:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingDeal) return;
    setProcessingId(editingDeal.id);

    try {
      const res = await fetch("/api/admin/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: editingDeal.id,
          action: "UPDATE",
          promoCode: editPromoCode,
          eligibility: editEligibility,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.deal) {
          setDeals((prev) => prev.map((d) => (d.id === editingDeal.id ? data.deal : d)));
          setEditingDeal(null);
        }
      }
    } catch (err) {
      console.error("Failed to update deal:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-white shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Awaiting Verification</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{counts.needsReview}</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-white shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Published Live</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{counts.published}</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-white shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Rejected / Invalid</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{counts.rejected}</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-white shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Ingested</p>
          <p className="text-2xl font-black text-text mt-1">{counts.total}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-border">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setFilterTab("NEEDS_REVIEW")}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              filterTab === "NEEDS_REVIEW"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-text-muted hover:bg-slate-100"
            }`}
          >
            Needs Review ({counts.needsReview})
          </button>
          <button
            onClick={() => setFilterTab("PUBLISHED")}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              filterTab === "PUBLISHED"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-text-muted hover:bg-slate-100"
            }`}
          >
            Published ({counts.published})
          </button>
          <button
            onClick={() => setFilterTab("REJECTED")}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              filterTab === "REJECTED"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-text-muted hover:bg-slate-100"
            }`}
          >
            Rejected ({counts.rejected})
          </button>
          <button
            onClick={() => setFilterTab("ALL")}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              filterTab === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-text-muted hover:bg-slate-100"
            }`}
          >
            All Candidates ({counts.total})
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by vendor or title..."
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Candidates List */}
      {filteredDeals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-border">
          <ShieldCheck className="h-10 w-10 text-text-muted mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-text">No deal candidates found</p>
          <p className="text-xs text-text-muted mt-1">Try switching tabs or adjusting search criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDeals.map((deal) => {
            const isProcessing = processingId === deal.id;
            const scoreColor =
              deal.verificationScore >= 80
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : deal.verificationScore >= 50
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200";

            return (
              <div
                key={deal.id}
                className="p-5 rounded-2xl border border-border bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs text-slate-800 font-mono">{deal.vendor}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {deal.dealType}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${scoreColor}`}>
                      Verification: {deal.verificationScore}/100
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      deal.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-800"
                        : deal.status === "REJECTED"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {deal.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-text">{deal.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{deal.summary}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted pt-1">
                    {deal.promoCode && (
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-semibold">
                        Code: {deal.promoCode}
                      </span>
                    )}
                    {deal.detectedValueNprMinor && (
                      <span>Est. Value: NPR {(deal.detectedValueNprMinor / 100).toLocaleString()}</span>
                    )}
                    {deal.officialVendorUrl && (
                      <a
                        href={deal.officialVendorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-primary hover:underline"
                      >
                        Official Vendor URL <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    {deal.vendorClaimSummary && (
                      <span className="text-slate-500 italic">Audit: {deal.vendorClaimSummary}</span>
                    )}
                  </div>
                </div>

                {/* Queue Action Buttons */}
                <div className="flex flex-wrap md:flex-col items-center gap-2 shrink-0 self-end md:self-center">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction(deal.id, "APPROVE", "FREE")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                      title="Approve as free link-only deal"
                    >
                      Approve Free
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction(deal.id, "APPROVE", "PAID")}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                      title="Approve as curated paid discount deal"
                    >
                      Approve Paid Deal
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDeal(deal);
                        setEditPromoCode(deal.promoCode || "");
                        setEditEligibility(deal.eligibility || "");
                      }}
                      className="p-1.5 rounded-lg border border-border text-text-muted hover:text-text hover:bg-slate-50 text-xs"
                      title="Quick edit promo code & eligibility"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction(deal.id, "REJECT")}
                      className="px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingDeal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text">Edit Deal Candidate</h3>
              <button
                onClick={() => setEditingDeal(null)}
                className="p-1 rounded-lg text-text-muted hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-text-muted">{editingDeal.title}</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-text mb-1">Promo Code</label>
                <input
                  type="text"
                  value={editPromoCode}
                  onChange={(e) => setEditPromoCode(e.target.value)}
                  placeholder="e.g. TRIHEX2026"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Eligibility Criteria</label>
                <textarea
                  rows={3}
                  value={editEligibility}
                  onChange={(e) => setEditEligibility(e.target.value)}
                  placeholder="e.g. Enrolled students with valid .edu email"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingDeal(null)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs text-text-muted hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm hover:opacity-90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
