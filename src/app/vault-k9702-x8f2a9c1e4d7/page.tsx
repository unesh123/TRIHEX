import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { checkAdminSession, isAdminDevBypassEnabled } from "@/lib/auth/admin-gate";
import { Logo } from "@/components/brand/logo";
import {
  adminLoginAction,
  adminRequestPasswordResetAction,
} from "@/app/admin/login/actions";
import {
  ShieldCheck,
  Lock,
  Terminal,
  KeyRound,
  AlertTriangle,
  Radio,
  Fingerprint,
  UserCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Vault Gateway Clearance · Zone 9702-X8F2A9C1E4D7",
  description: "Cryptographically protected operator command clearance terminal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EncryptedSecretAdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const headerList = await headers();

  const gate = await checkAdminSession(headerList);
  if (gate.ok && !gate.session.bypass) {
    redirect("/admin");
  }

  const params = await searchParams;
  const bypass = isAdminDevBypassEnabled();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070f] px-4 py-12 text-slate-100 antialiased selection:bg-cyan-500/30">
      {/* Background Matrix Grid */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-35"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-600/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/30 bg-slate-900/95 p-6 shadow-[0_0_60px_rgba(6,182,212,0.18)] backdrop-blur-2xl sm:p-8">
        {/* Stealth Encrypted Header Pill */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <Logo href="/" size="sm" />
          <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/60 px-3 py-1 text-[10px] font-mono font-bold tracking-wider text-cyan-300 uppercase shadow-inner">
            <Radio className="h-3 w-3 animate-pulse text-cyan-400" />
            <span>CIPHER-K9702-X8F2</span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
            <Fingerprint className="h-3.5 w-3.5" />
            <span>Encrypted Operator Gateway</span>
          </div>
          <h1 className="mt-1 font-[family-name:var(--font-sora)] text-2xl font-black tracking-tight text-white">
            Root Command Terminal
          </h1>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed font-mono">
            Encrypted Clearance Terminal &bull; Confidential
          </p>
        </div>

        {/* Status / Alert feedback */}
        {bypass ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Dev bypass active (local environment). Never enable in production.</span>
          </div>
        ) : null}

        {params.error ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>Authentication failed. Incorrect Operator ID or password.</span>
          </div>
        ) : null}

        {params.reset === "sent" ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Password reset token dispatched to authorized administrator mailbox.</span>
          </div>
        ) : null}

        {/* Section 1: Direct Operator ID & Password Login Form */}
        <form action={adminLoginAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="loginId"
              className="block font-mono text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Operator Login ID
            </label>
            <Input
              id="loginId"
              name="loginId"
              type="text"
              required
              autoComplete="username"
              placeholder="Operator ID or Authorized Email"
              className="mt-1.5 border-slate-800 bg-slate-950/80 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-mono text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Master Password / Passkey
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="mt-1.5 border-slate-800 bg-slate-950/80 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 font-semibold text-white shadow-lg shadow-cyan-950/50 hover:from-cyan-500 hover:to-indigo-500 focus:ring-2 focus:ring-cyan-500"
          >
            Authenticate Operator Clearance
          </Button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 text-center">
          <p className="text-[11px] font-mono text-cyan-300/80 leading-relaxed">
            Direct credential authentication required. Google SSO disabled during system security audit.
          </p>
        </div>

        {/* Password Reset Dispatcher */}
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <form action={adminRequestPasswordResetAction} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Need password recovery?</span>
            </div>
            <div className="flex gap-2">
              <Input
                name="loginId"
                type="text"
                placeholder="Enter Operator ID or Email"
                className="h-8 border-slate-800 bg-slate-950/60 font-mono text-xs text-slate-200 placeholder:text-slate-600"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="h-8 shrink-0 font-mono text-xs"
              >
                Send Reset
              </Button>
            </div>
          </form>
        </div>

        {/* Telemetry info */}
        <div className="mt-6 flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-800/40 pt-3">
          <span>ZONE: K9702</span>
          <span>CIPHER: X8F2A9C1E4D7</span>
        </div>
      </div>
    </div>
  );
}
