"use client";

import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

interface GoogleAuthButtonProps {
  label?: string;
  nextUrl?: string;
  className?: string;
  variant?: "light" | "dark";
  isAdmin?: boolean;
}

/**
 * GoogleAuthButton: Temporarily offline for root security review and domain verification.
 * Zero modals, zero data exposure, zero unauthenticated endpoints.
 */
export function GoogleAuthButton({
  className = "",
  isAdmin = false,
}: GoogleAuthButtonProps) {
  useEffect(() => {
    // Purge any stale client-side cache from previous sessions
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("trihex_saved_google_accounts");
      }
    } catch {
      // ignore
    }
  }, []);

  if (isAdmin) {
    return (
      <div className={`rounded-xl border border-blue-500/30 bg-blue-950/30 p-3 text-center ${className}`}>
        <p className="text-xs text-blue-200">
          Google Single Sign-On is temporarily offline for scheduled root security review. Please authenticate with your operator credentials above.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-center ${className}`}>
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 mb-2.5">
        <ShieldAlert className="h-4 w-4" />
      </div>
      <p className="text-xs font-semibold text-slate-800">
        Google Authentication Offline for Maintenance
      </p>
      <p className="mt-1 text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
        We are completing a security & privacy review. You do not need an account to track your orders or receive delivery updates.
      </p>
      <div className="mt-3 flex items-center justify-center gap-3 text-xs font-semibold">
        <Link
          href="/track-order"
          className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-white hover:bg-blue-700 transition"
        >
          Track My Order
        </Link>
        <Link
          href="/contact"
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-slate-700 hover:bg-slate-100 transition"
        >
          Priority Support
        </Link>
      </div>
    </div>
  );
}
