"use client";

import { useState, useTransition } from "react";
import { 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  Clock, 
  Filter, 
  CreditCard,
  History,
  Sparkles,
  Eye
} from "lucide-react";
import { DealCandidate, DealType } from "@/lib/deals/types";

interface DealRadarManagerProps {
  initialDeals: DealCandidate[];
}

export function DealRadarManager({ initialDeals }: DealRadarManagerProps) {
  const [deals, setDeals] = useState<DealCandidate[]>(initialDeals);
  const [selectedCandidate, setSelectedCandidate] = useState<DealCandidate | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const stats = {
    total: deals.length,
    published: deals.filter((d) => d.status === "PUBLISHED").length,
    verified: deals.filter((d) => d.status === "VERIFIED").length,
    needsReview: deals.filter((d) => d.status === "NEEDS_REVIEW").length,
    expired: deals.filter((d) => d.status === "EXPIRED").length,
  };

  const filteredDeals = deals.filter((d) => {
    if (statusFilter !== "ALL" && d.status !== statusFilter) return false;
    return true;
  });

  const handleAction = async (
    candidateId: string,
    action: "approve" | "reject" | "verify",
    options?: { approvalType?: "FREE" | "PAID"; reason?: string }
  ) => {
    setActionLoadingId(candidateId);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          candidateId,
          approvalType: options?.approvalType,
          reason: options?.reason,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "Action failed");
      }

      setDeals((prev) =>
        prev.map((item) => (item.id === candidateId ? data.deal : item))
      );

      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(data.deal);
      }

      setMessage({
        text: `Deal successfully ${action === "verify" ? "verified" : action === "approve" ? "approved" : "rejected"}!`,
        type: "success",
      });
    } catch (err: any) {
      setMessage({
        text: err?.message || "Operation failed",
        type: "error",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
          <div className="text-xs text-text-muted">Total Discovered</div>
          <div className="text-2xl font-bold text-text mt-0.5">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
          <div className="text-xs text-emerald-600 font-medium">Published Live</div>
          <div className="text-2xl font-bold text-emerald-700 mt-0.5">{stats.published}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
          <div className="text-xs text-blue-600 font-medium">Verified Queue</div>
          <div className="text-2xl font-bold text-blue-700 mt-0.5">{stats.verified}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
          <div className="text-xs text-amber-600 font-medium">Needs Review</div>
          <div className="text-2xl font-bold text-amber-700 mt-0.5">{stats.needsReview}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
          <div className="text-xs text-rose-600 font-medium">Expired</div>
          <div className="text-2xl font-bold text-rose-700 mt-0.5">{stats.expired}</div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-sm border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "VERIFIED", "NEEDS_REVIEW", "PUBLISHED", "EXPIRED", "REJECTED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === st
                ? "bg-[var(--surface-ink)] text-white"
                : "bg-white border border-border text-text-muted hover:bg-surface-raised"
            }`}
          >
            {st.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Candidates Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-raised/60 text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-4 py-3">Vendor / Deal Title</th>
              <th className="px-4 py-3">Type & Value</th>
              <th className="px-4 py-3">Vendor Verification</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredDeals.map((deal) => {
              const isLoading = actionLoadingId === deal.id;
              return (
                <tr key={deal.id} className="hover:bg-surface-raised/30 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-text">{deal.title}</div>
                    <div className="text-xs text-text-muted mt-0.5 flex items-center gap-2">
                      <span>{deal.vendor}</span>
                      <span>•</span>
                      <a
                        href={deal.sourceClaimUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-blue-600 hover:underline"
                      >
                        Resourify Claim <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs font-semibold text-text">{deal.dealType}</div>
                    <div className="text-xs text-text-muted">
                      {deal.detectedValueNprMinor
                        ? `~NPR ${(deal.detectedValueNprMinor / 100).toLocaleString()}`
                        : "Free Tier"}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          deal.verificationScore >= 75
                            ? "bg-emerald-100 text-emerald-800"
                            : deal.verificationScore >= 40
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {deal.verificationScore}% Score
                      </span>
                    </div>
                    {deal.vendorClaimSummary && (
                      <div className="text-[11px] text-text-muted mt-1 max-w-xs line-clamp-1">
                        {deal.vendorClaimSummary}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        deal.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-800"
                          : deal.status === "VERIFIED"
                          ? "bg-blue-100 text-blue-800"
                          : deal.status === "NEEDS_REVIEW"
                          ? "bg-amber-100 text-amber-800"
                          : deal.status === "EXPIRED"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {deal.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedCandidate(deal)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-surface border border-border hover:bg-surface-raised text-text"
                    >
                      Split View
                    </button>

                    {deal.status !== "PUBLISHED" && (
                      <button
                        disabled={isLoading}
                        onClick={() => handleAction(deal.id, "approve", { approvalType: "FREE" })}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                      >
                        Approve Free
                      </button>
                    )}

                    <button
                      disabled={isLoading}
                      onClick={() => handleAction(deal.id, "verify")}
                      className="p-1 text-text-muted hover:text-text rounded-lg hover:bg-surface-raised"
                      title="Run real-time vendor verification"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Split-View Verification & Review Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-border p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Secondary Claim Verification Split-View
                </span>
                <h2 className="text-xl font-bold text-text mt-0.5">{selectedCandidate.title}</h2>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1 text-text-muted hover:text-text rounded-lg hover:bg-surface"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Split View Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Discovered 3rd Party Claim */}
              <div className="rounded-xl border border-border bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Third-Party Claim (Resourify)</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                    UNVERIFIED CANDIDATE
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700">Vendor:</span> {selectedCandidate.vendor}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Deal Type:</span> {selectedCandidate.dealType}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Stated Value:</span>{" "}
                    {selectedCandidate.detectedValueNprMinor
                      ? `NPR ${(selectedCandidate.detectedValueNprMinor / 100).toLocaleString()}`
                      : "Not specified"}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Promo Code:</span>{" "}
                    <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">
                      {selectedCandidate.promoCode || "None"}
                    </code>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Eligibility:</span> {selectedCandidate.eligibility}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Card Required:</span>{" "}
                    {selectedCandidate.cardRequired ? "Yes" : "No"}
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-700">Summary:</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">{selectedCandidate.summary}</p>
                  </div>
                </div>
              </div>

              {/* Right: Official Vendor Verification */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-blue-950">Official Vendor Source</h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-blue-700">
                    <ShieldCheck className="w-4 h-4" />
                    {selectedCandidate.verificationScore}% Match
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700">Official URL:</span>{" "}
                    <a
                      href={selectedCandidate.officialVendorUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {selectedCandidate.officialVendorUrl}
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Verification Status:</span>{" "}
                    <span className="font-semibold text-blue-900">{selectedCandidate.status}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Last Verified:</span>{" "}
                    {selectedCandidate.lastVerifiedAt
                      ? new Date(selectedCandidate.lastVerifiedAt).toLocaleString()
                      : "Not verified yet"}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Automated Audit Notes:</span>
                    <p className="text-slate-700 mt-1 bg-white p-2 rounded border border-blue-100 font-mono text-[11px]">
                      {selectedCandidate.vendorClaimSummary || "Pending live verification."}
                    </p>
                  </div>
                  {selectedCandidate.verificationReport?.detectedVendorTextSnippet && (
                    <div>
                      <span className="font-semibold text-slate-700">Detected Vendor Text:</span>
                      <p className="text-slate-600 text-[11px] italic mt-1 bg-white/80 p-2 rounded border border-blue-100">
                        &ldquo;{selectedCandidate.verificationReport.detectedVendorTextSnippet}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Decision Bar */}
            <div className="border-t border-border pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  disabled={actionLoadingId === selectedCandidate.id}
                  onClick={() => handleAction(selectedCandidate.id, "verify")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border hover:bg-surface-raised text-text"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Re-Verify Vendor
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={actionLoadingId === selectedCandidate.id}
                  onClick={() => handleAction(selectedCandidate.id, "reject", { reason: "Terms mismatch" })}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                >
                  Reject Candidate
                </button>
                <button
                  disabled={actionLoadingId === selectedCandidate.id}
                  onClick={() => handleAction(selectedCandidate.id, "approve", { approvalType: "PAID" })}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                >
                  Approve as Paid Service
                </button>
                <button
                  disabled={actionLoadingId === selectedCandidate.id}
                  onClick={() => handleAction(selectedCandidate.id, "approve", { approvalType: "FREE" })}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                >
                  Approve Free (Publish Live)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
