"use client";

import { useState } from "react";
import { Plus, X, Sparkles, Tag, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DealCandidate } from "@/lib/deals/types";

interface QuickDealModalProps {
  onDealCreated: (deal: DealCandidate) => void;
}

export function QuickDealModal({ onDealCreated }: QuickDealModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    vendor: "",
    category: "AI",
    dealType: "PROMO_CODE",
    detectedValueNpr: "",
    promoCode: "",
    eligibility: "Universal / All customers",
    officialVendorUrl: "",
    summary: "",
    approvalType: "FREE",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.vendor) {
      setError("Title and Vendor are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...formData,
          detectedValueNpr: formData.detectedValueNpr ? Number(formData.detectedValueNpr) : null,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to create deal");
      }

      onDealCreated(data.deal);
      setOpen(false);
      setFormData({
        title: "",
        vendor: "",
        category: "AI",
        dealType: "PROMO_CODE",
        detectedValueNpr: "",
        promoCode: "",
        eligibility: "Universal / All customers",
        officialVendorUrl: "",
        summary: "",
        approvalType: "FREE",
      });
    } catch (err: any) {
      setError(err?.message || "Failed to create deal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 gap-1.5 shadow-sm"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>New Deal Candidate</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Create New Deal Candidate</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Deal Title *</label>
                  <Input
                    required
                    placeholder="e.g. DigitalOcean $200 Credits"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-8 bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Vendor *</label>
                  <Input
                    required
                    placeholder="e.g. DigitalOcean"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="h-8 bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-8 rounded-lg bg-slate-950 border border-slate-800 px-2 text-xs text-white"
                  >
                    <option value="AI">AI Tools</option>
                    <option value="CLOUD">Cloud Compute</option>
                    <option value="DEVELOPER">Developer Tools</option>
                    <option value="EDUCATION">Education / Student</option>
                    <option value="DESIGN">Design & Media</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Deal Type</label>
                  <select
                    value={formData.dealType}
                    onChange={(e) => setFormData({ ...formData, dealType: e.target.value })}
                    className="w-full h-8 rounded-lg bg-slate-950 border border-slate-800 px-2 text-xs text-white"
                  >
                    <option value="PROMO_CODE">Promo Code</option>
                    <option value="CREDITS">Free Credits</option>
                    <option value="STUDENT_TIER">Student Perk</option>
                    <option value="FREE_TIER">Free Tier</option>
                    <option value="LIFETIME">Lifetime Deal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Value (NPR)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 27000"
                    value={formData.detectedValueNpr}
                    onChange={(e) => setFormData({ ...formData, detectedValueNpr: e.target.value })}
                    className="h-8 bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Promo Code (Optional)</label>
                  <Input
                    placeholder="e.g. DO-FREE-200"
                    value={formData.promoCode}
                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                    className="h-8 bg-slate-950 border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Approval Mode</label>
                  <select
                    value={formData.approvalType}
                    onChange={(e) => setFormData({ ...formData, approvalType: e.target.value })}
                    className="w-full h-8 rounded-lg bg-slate-950 border border-slate-800 px-2 text-xs text-white"
                  >
                    <option value="FREE">FREE (External Link)</option>
                    <option value="PAID">PAID (Storefront Checkout)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Official Claim / Vendor URL</label>
                <Input
                  type="url"
                  placeholder="https://vendor.com/promo"
                  value={formData.officialVendorUrl}
                  onChange={(e) => setFormData({ ...formData, officialVendorUrl: e.target.value })}
                  className="h-8 bg-slate-950 border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Eligibility Criteria</label>
                <Input
                  placeholder="e.g. Verified university email or new accounts"
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  className="h-8 bg-slate-950 border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Summary / Pitch</label>
                <textarea
                  rows={2}
                  placeholder="Highlight key advantages, credit amount, or terms..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-xs text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="text-xs h-8 text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-8"
                >
                  {loading ? "Publishing..." : "Publish Deal to Vault"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
