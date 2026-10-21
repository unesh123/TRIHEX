import Link from "next/link";
import { ShieldAlert, Lock, ArrowLeft, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "Access Denied · Unauthorized Account",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminUnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070913] px-4 py-12 text-slate-100 antialiased selection:bg-rose-500/30">
      {/* Background Matrix Grid */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-35"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-rose-600/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-rose-500/30 bg-slate-900/95 p-6 shadow-[0_0_60px_rgba(244,63,94,0.18)] backdrop-blur-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <Logo href="/" size="sm" />
          <div className="flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/60 px-3 py-1 text-[10px] font-mono font-bold tracking-wider text-rose-300 uppercase">
            <Lock className="h-3 w-3 text-rose-400" />
            <span>SECURITY REJECTION · 403</span>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-sora)] text-xl font-black tracking-tight text-white">
              Unauthorized Google Account
            </h1>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed font-mono">
              The TRIHEX Root Command Workspace is strictly restricted to the authorized operator identity.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-rose-900/40 bg-rose-950/20 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 font-mono">
            Attempted Account:
          </p>
          <p className="mt-1 font-mono text-sm font-bold text-white break-all">
            {email || "Unknown Account"}
          </p>
          <p className="mt-2 text-xs text-rose-300/80 leading-relaxed">
            This account does not have Root Super Admin clearance. If you are the owner, please switch to your registered Google administrator account in your browser.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="/vault-k9702-x8f2a9c1e4d7"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-rose-950/50 transition-all hover:brightness-110 active:scale-[0.99]"
          >
            <LogOut className="h-4 w-4" />
            <span>Switch Google Account & Retry</span>
          </Link>

          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Storefront</span>
          </Link>
        </div>

        <div className="mt-6 border-t border-slate-800 pt-4 text-center">
          <p className="text-[10px] font-mono text-slate-500">
            Incident logged in cryptographic security audit log with IP & telemetry.
          </p>
        </div>
      </div>
    </div>
  );
}
