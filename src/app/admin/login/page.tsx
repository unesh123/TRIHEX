import Link from "next/link";
import { redirect } from "next/navigation";
import {
  adminLoginAction,
  adminRequestPasswordResetAction,
} from "@/app/admin/login/actions";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkAdminSession, isAdminDevBypassEnabled } from "@/lib/auth/admin-gate";
import { getOwnerEmail } from "@/lib/auth/owner";
import { headers } from "next/headers";
import { ShieldCheck, Lock, AlertTriangle, Terminal, KeyRound } from "lucide-react";

export const metadata = {
  title: "Admin Sign In | TRIHEX Operations Command Center",
  description: "Secure, authenticated access portal for TRIHEX DIGITAL operations staff.",
};

function maskEmail(email: string): string {
  const [u, d] = email.split("@");
  if (!u || !d) return "";
  return `${u.slice(0, 2)}***@${d}`;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const gate = await checkAdminSession(await headers());
  if (gate.ok && !gate.session.bypass) {
    redirect("/admin");
  }

  const params = await searchParams;
  const bypass = isAdminDevBypassEnabled();
  const bootstrapEmail = getOwnerEmail();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100 antialiased">
      {/* Ambient background matrix grid */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25"
        aria-hidden="true"
      />
      <div 
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" 
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-black/80 backdrop-blur-xl sm:p-8">
        {/* Header telemetry badge */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
          <Logo href="/" size="sm" />
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span>Zone L4 Kat</span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Terminal className="h-3.5 w-3.5" />
            <span>Ops Command Center</span>
          </div>
          <h1 className="mt-1 font-mono text-2xl font-bold tracking-tight text-white sm:text-2xl">
            Operator Authentication
          </h1>
          <p className="mt-1.5 text-xs text-slate-400">
            Authorized TRIHEX administrators only. Authenticate to manage inventory, deals, news feeds, and security.
          </p>
        </div>

        {/* Status / Alert feedback */}
        {bypass ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Dev bypass active (local environment). Never enable in production.</span>
          </div>
        ) : null}

        {params.reset === "sent" ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Reset link dispatched. Please inspect authorized mailbox.</span>
          </div>
        ) : null}

        {params.reset === "required" ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs text-amber-300">
            <KeyRound className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Password rotation required. Request reset link below to update credentials.</span>
          </div>
        ) : null}

        {params.reset === "1" ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Credentials updated successfully. Sign in to proceed to MFA step.</span>
          </div>
        ) : null}

        {params.error ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>
              {params.error === "email_required"
                ? "Authorized operator email is required."
                : params.error === "password_required"
                ? "Password cannot be empty."
                : params.error === "invalid_credentials"
                ? "Authentication failed. Invalid email or password."
                : "Sign-in rejected by authentication gateway."}
            </span>
          </div>
        ) : null}

        {/* Primary Login Form */}
        <form action={adminLoginAction} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              Operator Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={bootstrapEmail}
              required
              autoComplete="username"
              className="mt-1.5 border-slate-700 bg-slate-950/80 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {!bypass ? (
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                >
                  Password
                </label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1.5 border-slate-700 bg-slate-950/80 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          ) : (
            <input type="hidden" name="password" value="dev-bypass" />
          )}

          <Button
            type="submit"
            className="w-full bg-cyan-600 font-semibold text-white hover:bg-cyan-500 shadow-md shadow-cyan-600/20"
          >
            {bypass ? "Authenticate (Dev Bypass Active)" : "Authenticate Session"}
          </Button>
        </form>

        {/* Password Reset Section */}
        {!bypass ? (
          <form
            action={adminRequestPasswordResetAction}
            className="mt-5 space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Lock className="h-3 w-3 text-cyan-400" />
              <span>Password Recovery & Setup</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              First-time login: enter authorized email below to receive a secure token.
            </p>
            <Input
              id="reset-email"
              name="email"
              type="email"
              defaultValue={bootstrapEmail}
              placeholder="Authorized admin email"
              required
              autoComplete="email"
              className="h-8 border-slate-800 bg-slate-900 text-xs text-slate-200 placeholder:text-slate-600"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full border-slate-700 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Request Password Reset Link
            </Button>
          </form>
        ) : null}

        {/* Security & Audit Disclaimer */}
        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-[10px] leading-relaxed text-slate-500">
          <p className="font-semibold uppercase tracking-wider text-slate-400">
            Security & Compliance Notice
          </p>
          <p className="mt-0.5">
            All sign-in events, session activities, and administrative actions are logged with keyed HMAC nonces and immutable audit timestamps. Unauthorized access attempts violate cybersecurity policy and will trigger automatic lockout.
          </p>
          <p className="mt-1 text-slate-400">
            Authorized bootstrap owner: <span className="font-mono text-slate-300">{maskEmail(bootstrapEmail)}</span>
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-5 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 transition hover:text-cyan-400 hover:underline"
          >
            ← Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
