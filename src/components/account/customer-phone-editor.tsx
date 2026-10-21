"use client";

import { useState } from "react";
import { Phone, Check, Copy, Save, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface CustomerPhoneEditorProps {
  initialPhone: string | null;
  customerCode: string;
}

export function CustomerPhoneEditor({
  initialPhone,
  customerCode,
}: CustomerPhoneEditorProps) {
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone || "");
  const [isEditing, setIsEditing] = useState(!initialPhone);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(customerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 7) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSavedSuccess(false), 3000);
        router.refresh();
      } else {
        setErrorMsg(data.error || "Failed to update phone number.");
      }
    } catch {
      setErrorMsg("Network error saving phone number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* 1. Customer User ID Card */}
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 p-5 text-white shadow-md">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Verified Customer User ID</span>
          </span>
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300 font-mono">
            OFFICIAL
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-slate-950/80 px-4 py-3 font-mono">
          <span className="text-base sm:text-lg font-black tracking-wider text-amber-300">
            {customerCode}
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>

        <p className="mt-2.5 text-[11px] text-slate-400 leading-relaxed">
          Provide this User ID to Trix on WhatsApp to verify payments and activate your VIP Vault clearance.
        </p>
      </div>

      {/* 2. WhatsApp Mobile Number Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm text-slate-900">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1.5 text-indigo-600">
            <Phone className="h-3.5 w-3.5" />
            <span>WhatsApp / Mobile Number</span>
          </span>
          {!isEditing && phone && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
            >
              Edit Number
            </button>
          )}
        </div>

        <div className="mt-3">
          {isEditing ? (
            <form onSubmit={handleSavePhone} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9801970291"
                  className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
              {errorMsg && <p className="text-[11px] text-rose-600">{errorMsg}</p>}
            </form>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 font-mono text-sm font-bold text-slate-800">
              <span>{phone}</span>
              <span className="text-[11px] text-emerald-600 font-sans font-semibold">
                Linked for VIP
              </span>
            </div>
          )}
        </div>

        <p className="mt-2.5 text-[11px] text-slate-500 leading-relaxed">
          Admin will identify your Google account and verify your orders via this WhatsApp mobile number.
        </p>

        {savedSuccess && (
          <p className="mt-1.5 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Number linked successfully!
          </p>
        )}
      </div>
    </div>
  );
}
