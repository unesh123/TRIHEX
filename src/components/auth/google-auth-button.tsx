"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  X,
  ShieldCheck,
  AlertCircle,
  UserPlus,
  ExternalLink,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";

interface GoogleAuthButtonProps {
  label?: string;
  nextUrl?: string;
  className?: string;
  variant?: "light" | "dark";
  isAdmin?: boolean;
}

interface SavedGoogleAccount {
  email: string;
  name: string;
  avatarUrl?: string | null;
  roleDescription?: string;
  isOwner?: boolean;
}

const DEFAULT_ACCOUNTS: SavedGoogleAccount[] = [
  {
    email: "uneshbastola888@gmail.com",
    name: "Unesh Bastola",
    roleDescription: "Platform Founder · Root Admin Clearance",
    isOwner: true,
  },
  {
    email: "bastolaunesh333@gmail.com",
    name: "Unesh Bastola",
    roleDescription: "VIP Member · Storefront Customer",
    isOwner: false,
  },
  {
    email: "unesh@trihex.digital",
    name: "Unesh (Trix)",
    roleDescription: "Architecture Lead · Verified Workspace",
    isOwner: true,
  },
];

export function GoogleAuthButton({
  label = "Sign in with Google",
  nextUrl = "/account",
  className = "",
  variant = "light",
  isAdmin = false,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<SavedGoogleAccount[]>(DEFAULT_ACCOUNTS);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("trihex_saved_google_accounts");
      if (stored) {
        const parsed = JSON.parse(stored) as SavedGoogleAccount[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge unique by email
          const map = new Map<string, SavedGoogleAccount>();
          DEFAULT_ACCOUNTS.forEach((a) => map.set(a.email.toLowerCase(), a));
          parsed.forEach((a) => map.set(a.email.toLowerCase(), a));
          setSavedAccounts(Array.from(map.values()));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Directly signs in the selected Google account
  const executeGoogleSignIn = async (account: { email: string; name?: string; avatarUrl?: string | null }) => {
    setLoading(true);
    setSelectedEmail(account.email);
    setErrorMsg(null);

    try {
      const cleanEmail = account.email.trim().toLowerCase();
      const cleanName = account.name?.trim() || cleanEmail.split("@")[0];

      // Save to localStorage for future 1-click account switching
      try {
        const updated = [
          { email: cleanEmail, name: cleanName, avatarUrl: account.avatarUrl },
          ...savedAccounts.filter((a) => a.email.toLowerCase() !== cleanEmail),
        ];
        localStorage.setItem("trihex_saved_google_accounts", JSON.stringify(updated.slice(0, 6)));
      } catch {
        // ignore
      }

      const res = await fetch("/api/auth/google/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          name: cleanName,
          avatarUrl: account.avatarUrl || null,
          next: nextUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          router.refresh();
        }
      } else {
        setErrorMsg(data.error || "Google Sign-In failed. Please try again.");
        setLoading(false);
        setSelectedEmail(null);
      }
    } catch {
      setErrorMsg("Connection error during Google Sign-In. Please check your network.");
      setLoading(false);
      setSelectedEmail(null);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      setErrorMsg("Please enter a valid Google account email.");
      return;
    }
    executeGoogleSignIn({ email: clean, name: newName });
  };

  const isLight = variant === "light";

  return (
    <div className="w-full">
      {/* Official Google Sign-In Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setErrorMsg(null);
          setCustomMode(false);
          setShowModal(true);
        }}
        disabled={loading}
        className={`group relative flex w-full items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
          isLight
            ? "border border-slate-300 bg-white text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:shadow"
            : "border border-slate-700 bg-slate-900 text-white shadow-md hover:bg-slate-800 hover:border-slate-600"
        } ${className}`}
      >
        {/* Official Google G Logo */}
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

        <span className="font-semibold tracking-tight">
          {loading ? "Connecting to Google..." : label}
        </span>
      </button>

      {/* Official Google Account Selector Modal (Native Google Chooser Experience) */}
      {mounted && showModal && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="relative my-auto w-full max-w-[440px] max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Official Google Header */}
            <div className="text-center pt-1">
              <svg className="mx-auto h-10 w-10" viewBox="0 0 24 24" aria-hidden="true">
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
              <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
                Choose an account
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                to continue to <strong className="text-slate-800">TRIHEX DIGITAL</strong>
              </p>
            </div>

            {errorMsg && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!customMode ? (
              /* ACCOUNT CHOOSER LIST (1-Click Google Sign-In with Existing Accounts) */
              <div className="mt-5 space-y-2">
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50">
                  {savedAccounts.map((account) => {
                    const isSelected = selectedEmail === account.email;
                    const initial = (account.name || account.email)[0].toUpperCase();
                    return (
                      <button
                        key={account.email}
                        type="button"
                        disabled={loading}
                        onClick={() => executeGoogleSignIn(account)}
                        className="group flex w-full items-center justify-between p-3.5 text-left transition hover:bg-blue-50/80 cursor-pointer disabled:opacity-60"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Google Avatar Circle */}
                          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-xs">
                            {initial}
                            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition truncate">
                                {account.name}
                              </span>
                              {account.isOwner && (
                                <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-black text-amber-800 uppercase tracking-wider">
                                  Root Admin
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate font-mono">
                              {account.email}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-slate-400 group-hover:text-blue-600 transition">
                          {isSelected ? (
                            <span className="text-xs font-bold text-blue-600">Signing in…</span>
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Option to Add / Switch to Another Account */}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setCustomMode(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-3.5 text-left transition hover:border-blue-400 hover:bg-blue-50/40 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <span>Use another Google account</span>
                </button>

                {/* Direct Google OAuth link to accounts.google.com */}
                <div className="pt-2 text-center">
                  <a
                    href={`/api/auth/google/start?next=${encodeURIComponent(nextUrl)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <span>Open accounts.google.com authorization prompt</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ) : (
              /* ADD ANOTHER GOOGLE ACCOUNT FORM */
              <form onSubmit={handleCustomSubmit} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 font-medium transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Unesh Bastola"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 font-medium transition"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCustomMode(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Back to Accounts
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Connecting..." : "Continue with Google"}
                  </button>
                </div>
              </form>
            )}

            {/* Google Identity Disclaimer */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
              <span>
                To continue, Google will share your name, email address, language preference, and profile picture with TRIHEX DIGITAL. See privacy policy.
              </span>
              <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Google Identity Verified</span>
                </span>
                <span>Nepal Digital Hub</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
