"use client";

import { useState } from "react";
import { 
  Gift, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Lock, 
  ArrowRight,
  ShieldCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface FreeVaultItem {
  id: string;
  title: string;
  category: string;
  valuation: string;
  description: string;
  highlights: string[];
  accessUrl: string;
  badge?: string;
}

interface FreeVaultUnlockModalProps {
  item: FreeVaultItem;
  triggerButtonText?: string;
}

export function FreeVaultUnlockModal({ item, triggerButtonText = "Unlock Free Access" }: FreeVaultUnlockModalProps) {
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsapp.trim()) return;

    setLoading(true);
    try {
      // Record lead in background
      await fetch("/api/vault/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          title: item.title,
          email: email.trim() || undefined,
          whatsapp: whatsapp.trim(),
        }),
      }).catch(() => {
        // Safe failover
      });

      // Save unlock state locally
      if (typeof window !== "undefined") {
        localStorage.setItem(`unlocked_${item.id}`, "true");
      }

      setUnlocked(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.accessUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition-all hover:scale-[1.01]"
      >
        <Gift className="h-3.5 w-3.5" />
        <span>{triggerButtonText}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {!unlocked ? (
              <div>
                {/* Header Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  <Gift className="h-3 w-3" />
                  <span>Verified Free Drop • 100% Free</span>
                </div>

                <h3 className="mt-3 text-lg font-black tracking-tight text-white sm:text-xl">
                  {item.title}
                </h3>

                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span>Category: <strong className="text-slate-200">{item.category}</strong></span>
                  <span>•</span>
                  <span>Valued at: <strong className="text-emerald-400 font-mono">{item.valuation}</strong></span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-300">
                  {item.description}
                </p>

                {/* Highlights */}
                {item.highlights?.length > 0 && (
                  <ul className="mt-3 space-y-1.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
                    {item.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Lead Form */}
                <form onSubmit={handleUnlock} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      WhatsApp Number * (To receive direct access link)
                    </label>
                    <Input
                      type="tel"
                      required
                      placeholder="e.g. 98XXXXXXXX"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="h-9 bg-slate-950 border-slate-800 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Email Address (Optional)
                    </label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-9 bg-slate-950 border-slate-800 text-sm text-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg shadow-emerald-600/20"
                  >
                    {loading ? "Unlocking Access..." : "Unlock Verified Access Now"}
                  </Button>
                </form>

                <p className="mt-2.5 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span>No spam. Instant access link unmasked immediately.</span>
                </p>
              </div>
            ) : (
              /* Unlocked Content Screen */
              <div className="text-center py-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <h3 className="mt-3 text-lg font-bold text-white">Access Link Unlocked!</h3>
                <p className="mt-1 text-xs text-slate-300">
                  Your verified direct resource link for <strong>{item.title}</strong> is ready below:
                </p>

                {/* Direct Link Box */}
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-slate-950 p-3.5 text-left">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-300 break-all select-all">
                    <span>{item.accessUrl}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    onClick={handleCopyLink}
                    variant="outline"
                    className="flex-1 h-10 border-slate-700 bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copied ? "Copied!" : "Copy Link"}</span>
                  </Button>

                  <Button
                    href={item.accessUrl}
                    external
                    className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <span>Open Vault</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
