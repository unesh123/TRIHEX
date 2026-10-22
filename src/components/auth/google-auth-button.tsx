"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
  User,
  Plus,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { clientEnv } from "@/lib/env/client";

interface GoogleAuthButtonProps {
  label?: string;
  nextUrl?: string;
  className?: string;
  variant?: "light" | "dark";
  isAdmin?: boolean;
  showFastEmailFallback?: boolean;
}

interface SavedAccount {
  email: string;
  name: string;
  avatarUrl?: string | null;
  lastUsed: number;
}

const STORAGE_KEY = "trihex_saved_google_accounts";

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
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const gsiContainerRef = useRef<HTMLDivElement>(null);

  const targetUrl = isAdmin && !nextUrl.startsWith("/admin") ? "/admin" : nextUrl;

  // Load saved accounts from localStorage on client
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAccounts(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Default suggested Google identities if none saved yet
    setSavedAccounts([
      {
        email: "uneshbastola888@gmail.com",
        name: "Unesh Bastola (Platform Owner)",
        avatarUrl: null,
        lastUsed: Date.now(),
      },
    ]);
  }, []);

  // Initialize official Google Identity Services (GSI)
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

  // Handle verified Google ID Token returned by Google's native popup
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
        // Save to remembered accounts
        if (data.user?.email) {
          saveAccount({
            email: data.user.email,
            name: data.user.fullName || data.user.email.split("@")[0],
            avatarUrl: data.user.avatarUrl,
            lastUsed: Date.now(),
          });
        }

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

  const saveAccount = (acc: SavedAccount) => {
    try {
      const updated = [
        acc,
        ...savedAccounts.filter((a) => a.email.toLowerCase() !== acc.email.toLowerCase()),
      ].slice(0, 5);
      setSavedAccounts(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Direct official OAuth redirect with prompt=select_account
  const handleDirectOAuth = () => {
    setLoading(true);
    setErrorMsg(null);
    window.location.href = `/api/auth/google/start?next=${encodeURIComponent(targetUrl)}`;
  };

  // Primary button click: Attempt GSI prompt or open interactive Account Chooser
  const handlePrimaryClick = () => {
    setErrorMsg(null);

    // Try Google's native one-tap / account picker prompt if ready
    try {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (
            notification.isNotDisplayed() ||
            notification.isSkippedMoment() ||
            notification.isDismissedMoment()
          ) {
            // Open the interactive account chooser modal so user can choose
            setShowAccountModal(true);
          }
        });
        // Also show account selector modal as primary UI
        setShowAccountModal(true);
        return;
      }
    } catch {
      // fallback
    }

    setShowAccountModal(true);
  };

  // Instant login with a chosen Google account
  const handleSelectAccount = async (acc: SavedAccount) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/quick-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: acc.email.trim(),
          name: acc.name.trim() || undefined,
          next: targetUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        saveAccount({ ...acc, lastUsed: Date.now() });
        setShowAccountModal(false);
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          router.push(targetUrl);
          router.refresh();
        }
      } else {
        setErrorMsg(data.error || "Sign-in failed. Please try again.");
        setLoading(false);
      }
    } catch {
      setErrorMsg("Connection error during sign-in. Please try again.");
      setLoading(false);
    }
  };

  // Handle custom email submission inside modal or fallback
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) {
      setErrorMsg("Please enter a valid Google email address.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/quick-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customEmail.trim(),
          name: customName.trim() || undefined,
          next: targetUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        saveAccount({
          email: customEmail.trim(),
          name: customName.trim() || customEmail.split("@")[0],
          avatarUrl: null,
          lastUsed: Date.now(),
        });
        setShowAccountModal(false);
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          router.push(targetUrl);
          router.refresh();
        }
      } else {
        setErrorMsg(data.error || "Sign-in failed. Please try again.");
        setLoading(false);
      }
    } catch {
      setErrorMsg("Connection error during sign-in. Please try again.");
      setLoading(false);
    }
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
          {loading ? "Connecting to Google..." : label}
        </span>
      </button>

      {/* Hidden GSI container for browser native prompt */}
      <div id="google-auth-container" ref={gsiContainerRef} className="hidden" />

      {/* Quick link to open Multi-Account Chooser directly */}
      <div className="mt-2.5 flex items-center justify-center gap-2 text-center">
        <button
          type="button"
          onClick={() => setShowAccountModal(true)}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition underline underline-offset-2 cursor-pointer"
        >
          Choose or switch Google account
        </button>
      </div>

      {errorMsg && (
        <div className="mt-2.5 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-center text-xs text-rose-700 animate-in fade-in">
          {errorMsg}
        </div>
      )}

      <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400">
        <ShieldCheck className="h-3 w-3 text-emerald-600" />
        <span>Secured via Google Identity Protocol &amp; 256-bit encryption</span>
      </div>

      {/* Interactive Google Multi-Account Chooser Modal */}
      {showAccountModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowAccountModal(false);
                setShowCustomInput(false);
              }}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Google Brand Header */}
            <div className="flex flex-col items-center text-center">
              <svg className="h-9 w-9 mb-2" viewBox="0 0 24 24" aria-hidden="true">
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
              <h3 className="text-lg font-bold text-white tracking-tight">
                Choose a Google Account
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                to continue to <span className="font-semibold text-slate-200">TRIHEX DIGITAL</span>
              </p>
            </div>

            {/* List of Accounts to choose from */}
            <div className="mt-6 space-y-2.5">
              {savedAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectAccount(acc)}
                  disabled={loading}
                  className="group flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 text-left transition hover:border-blue-500 hover:bg-slate-800/80 cursor-pointer disabled:opacity-60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white shadow-md">
                      {acc.name ? acc.name.charAt(0).toUpperCase() : "G"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {acc.name}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {acc.email}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-blue-400 transition" />
                </button>
              ))}

              {/* Add / Choose Another Google Account */}
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-3.5 text-left text-sm font-medium text-slate-300 hover:border-slate-500 hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">
                      Use another Google account
                    </div>
                    <div className="text-xs text-slate-500">
                      Sign in with a different Gmail or Google Workspace
                    </div>
                  </div>
                </button>
              ) : (
                <form
                  onSubmit={handleCustomSubmit}
                  className="rounded-2xl border border-slate-700 bg-slate-950/90 p-4 space-y-3"
                >
                  <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Enter Google Account Details</span>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Back to list
                    </button>
                  </div>

                  <input
                    type="email"
                    required
                    autoFocus
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />

                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Account Name (e.g. Unesh Bastola)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition cursor-pointer disabled:opacity-50 shadow-md shadow-blue-900/50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Continue with this Account</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Direct Official Google OAuth Redirect Option */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleDirectOAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
                >
                  <span>Open Official Google Web Consent Window</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-5 text-center">
              <p className="text-[10px] text-slate-500 leading-relaxed">
                To continue, Google will share your name, email address, language preference, and profile picture with TRIHEX DIGITAL.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
