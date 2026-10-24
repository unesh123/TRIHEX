"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { clientEnv } from "@/lib/env/client";

interface GoogleAuthButtonProps {
  label?: string;
  nextUrl?: string;
  className?: string;
  variant?: "light" | "dark";
  isAdmin?: boolean;
}

export function GoogleAuthButton({
  label = "Continue with Google",
  nextUrl = "/account",
  className = "",
  variant = "light",
  isAdmin = false,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const gsiContainerRef = useRef<HTMLDivElement>(null);

  const targetUrl = isAdmin && !nextUrl.startsWith("/admin") ? "/admin" : nextUrl;

  // Initialize official Google Identity Services (GSI) One-Tap if available
  useEffect(() => {
    const clientId =
      clientEnv.googleClientId ||
      "1055636675498-jo31l5n9fouujd1htgdmo390arl95h7t.apps.googleusercontent.com";

    const loadGsiScript = () => {
      if (typeof window === "undefined") return;
      if (document.getElementById("google-gsi-script")) return;

      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        try {
          if ((window as any).google?.accounts?.id) {
            (window as any).google.accounts.id.initialize({
              client_id: clientId,
              callback: handleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
            });
          }
        } catch (err) {
          console.warn("[GSI] init note:", err);
        }
      };
      document.body.appendChild(script);
    };

    loadGsiScript();
  }, []);

  // Handle verified Google ID Token returned by Google's native secure prompt
  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/google/credential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: response.credential,
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
        setErrorMsg(data.error || "Google credential authentication failed.");
        setLoading(false);
      }
    } catch {
      setErrorMsg("Connection error verifying Google credential.");
      setLoading(false);
    }
  };

  // Primary Action: Open Google's official OAuth 2.0 flow
  const handlePrimaryClick = () => {
    setLoading(true);
    setErrorMsg(null);

    // Direct redirect to Google's official consent & account picker screen
    window.location.href = `/api/auth/google/start?next=${encodeURIComponent(targetUrl)}`;
  };

  const isLight = variant === "light";

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      {/* Primary Google Button */}
      <button
        type="button"
        onClick={handlePrimaryClick}
        disabled={loading}
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
          {loading ? "Redirecting to Google..." : label}
        </span>
      </button>

      {/* Hidden container for Google One-Tap */}
      <div id="google-auth-container" ref={gsiContainerRef} className="hidden" />

      {errorMsg && (
        <div className="mt-2.5 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-center text-xs text-rose-700 animate-in fade-in">
          {errorMsg}
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <span>Official Google OAuth 2.0 · 256-Bit SSL Verification</span>
      </div>
    </div>
  );
}
