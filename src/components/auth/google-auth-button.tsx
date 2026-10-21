"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase-browser";

interface GoogleAuthButtonProps {
  label?: string;
  nextUrl?: string;
  className?: string;
  variant?: "light" | "dark";
  isAdmin?: boolean;
}

export function GoogleAuthButton({
  label = "Sign in with Google",
  nextUrl = "/account",
  className = "",
  variant = "light",
  isAdmin = false,
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Purge any legacy leaked accounts stored in the browser's localStorage
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("trihex_saved_google_accounts");
      }
    } catch {
      // ignore
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);

    const targetUrl = isAdmin && !nextUrl.startsWith("/admin") ? "/admin" : nextUrl;

    try {
      // 1. Attempt official Supabase Google OAuth
      let supabaseClient = null;
      try {
        supabaseClient = createSupabaseBrowserClient();
      } catch {
        supabaseClient = null;
      }

      if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetUrl)}`,
            queryParams: {
              prompt: "select_account",
            },
          },
        });

        if (!error && data?.url) {
          window.location.href = data.url;
          return;
        }

        // If Supabase returned an error (e.g. provider not yet enabled in Supabase dashboard)
        if (error) {
          console.warn("[GoogleAuth] Supabase provider check:", error.message);
        }
      }

      // 2. Fallback to direct OAuth endpoint if Google Client ID is configured
      const directStartUrl = `/api/auth/google/start?next=${encodeURIComponent(targetUrl)}`;
      const testRes = await fetch(directStartUrl, { method: "HEAD", redirect: "manual" });
      
      // If direct route redirects (302/307 to accounts.google.com), navigate there
      if (testRes.status === 302 || testRes.status === 307 || testRes.type === "opaqueredirect") {
        window.location.href = directStartUrl;
        return;
      }

      // If neither is configured, show a helpful security message
      setErrorMsg(
        "Google OAuth is currently verifying its domain authorization with Google Cloud. Please try again shortly or contact support.",
      );
      setLoading(false);
    } catch (err) {
      console.error("[GoogleAuth] Error during OAuth redirect:", err);
      // Fallback: direct navigation to auth start
      try {
        window.location.href = `/api/auth/google/start?next=${encodeURIComponent(targetUrl)}`;
      } catch {
        setErrorMsg("Failed to initiate Google authentication. Please check your connection.");
        setLoading(false);
      }
    }
  };

  const isLight = variant === "light";

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`group relative flex w-full items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
          isLight
            ? "border border-slate-300 bg-white text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:shadow"
            : "border border-slate-700 bg-slate-900 text-white shadow-md hover:bg-slate-800 hover:border-slate-600"
        } ${className}`}
      >
        {/* Official Google G Logo */}
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

        <span className="font-semibold tracking-tight">
          {loading ? "Redirecting to Google..." : label}
        </span>
      </button>

      {errorMsg && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
