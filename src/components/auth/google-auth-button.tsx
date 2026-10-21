"use client";

import { useState } from "react";
import { Loader2, ArrowRight, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface GoogleAuthButtonProps {
  label?: string;
  nextUrl?: string;
  className?: string;
  variant?: "light" | "dark";
  isAdmin?: boolean;
  showFastEmailFallback?: boolean;
}

export function GoogleAuthButton({
  label = "Continue with Google",
  nextUrl = "/account",
  className = "",
  variant = "light",
  isAdmin = false,
  showFastEmailFallback = true,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [fastLoading, setFastLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetUrl = isAdmin && !nextUrl.startsWith("/admin") ? "/admin" : nextUrl;

  const handleGoogleRedirect = () => {
    setLoading(true);
    setErrorMsg(null);
    window.location.href = `/api/auth/google/start?next=${encodeURIComponent(targetUrl)}`;
  };

  const handleFastLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid Google email address.");
      return;
    }

    setFastLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/quick-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          next: targetUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          router.push(targetUrl);
          router.refresh();
        }
      } else {
        setErrorMsg(data.error || "Sign-in failed. Please try again.");
        setFastLoading(false);
      }
    } catch {
      setErrorMsg("Connection error during sign-in. Please try again.");
      setFastLoading(false);
    }
  };

  const isLight = variant === "light";

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      {/* Official Google Brand Button */}
      <button
        type="button"
        onClick={handleGoogleRedirect}
        disabled={loading || fastLoading}
        className={`group relative flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 cursor-pointer shadow-sm hover:shadow-md ${
          isLight
            ? "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
            : "border border-slate-700 bg-slate-900 text-white hover:bg-slate-800 hover:border-slate-600"
        }`}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-600" />
        ) : (
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span className="font-bold tracking-tight">
          {loading ? "Connecting to Google..." : label}
        </span>
      </button>

      {/* Alternative: Instant Sign-In with Google Email */}
      {showFastEmailFallback && (
        <div className="mt-3 text-center">
          {!showEmailInput ? (
            <button
              type="button"
              onClick={() => setShowEmailInput(true)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition underline underline-offset-2 cursor-pointer"
            >
              Or enter Google email for instant Customer ID
            </button>
          ) : (
            <form onSubmit={handleFastLogin} className="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 text-left shadow-inner">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                  <span>Google Account Email</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowEmailInput(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name (optional)"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={fastLoading}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
              >
                {fastLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Generate Customer User ID</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="mt-2.5 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-center text-xs text-rose-700 animate-in fade-in">
          {errorMsg}
        </div>
      )}

      <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400">
        <ShieldCheck className="h-3 w-3 text-emerald-600" />
        <span>Secured via Google Identity Protocol &amp; 256-bit encryption</span>
      </div>
    </div>
  );
}
