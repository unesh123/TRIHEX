import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { checkAdminSession, isAdminDevBypassEnabled } from "@/lib/auth/admin-gate";
import { Logo } from "@/components/brand/logo";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
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
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin Command Portal · TRIHEX DIGITAL",
  description: "Secure administrative command access and order fulfillment terminal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string; next?: string }>;
}) {
  const headerList = await headers();
  const gate = await checkAdminSession(headerList);

  if (gate.ok && !gate.session.bypass) {
    redirect("/admin");
  }

  const params = await searchParams;
  const bypass = isAdminDevBypassEnabled();

  const errorMessage = (() => {
    switch (params.error) {
      case "id_required":
        return "Please enter your Operator ID or Admin Email.";
      case "password_required":
        return "Please enter your administrative password.";
      case "invalid_credentials":
        return "Authentication failed. Incorrect Operator ID or password.";
      case "unauthorized_role":
        return "Your account does not have root administrator clearance.";
      case "auth_unavailable":
        return "Authentication service is temporarily unavailable. Try again in a moment.";
      case "bot_detected":
        return "Automated login submission rejected.";
      default:
        return params.error ? "Authentication error. Please check your credentials." : null;
    }
  })();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060813] px-4 py-12 text-slate-100 antialiased selection:bg-blue-500/30">
      {/* Background Matrix Grid */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-35"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-600/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-[0_0_60px_rgba(37,99,235,0.15)] backdrop-blur-2xl sm:p-8">
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <Logo href="/" size="sm" />
          <div className="flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-950/60 px-3 py-1 text-[10px] font-mono font-bold tracking-wider text-blue-300 uppercase shadow-inner">
            <Radio className="h-3 w-3 animate-pulse text-blue-400" />
            <span>OPERATOR PORTAL</span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 font-mono">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>TRIHEX DIGITAL ADMIN</span>
          </div>
          <h1 className="mt-1 font-[family-name:var(--font-sora)] text-2xl font-black tracking-tight text-white">
            Root Command Center
          </h1>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Manage live orders, VIP memberships, fulfillment dispatch, and digital catalog.
          </p>
        </div>

        {/* Status / Alert feedback */}
        {bypass ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Dev bypass active (local environment). Never enable in production.</span>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3 py-2.5 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {params.reset === "sent" ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Password reset link sent to your verified administrator email.</span>
          </div>
        ) : null}

        {/* Google Authentication Portal (Sole Authorized Access) */}
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/30 p-4 text-center">
            <p className="text-xs text-blue-200 leading-relaxed">
              Root administrator access requires an authenticated owner Google account with administrator clearance.
            </p>
          </div>

          <div className="pt-2">
            <GoogleAuthButton
              nextUrl="/admin"
              isAdmin={true}
              label="Sign in with Google Admin Account"
              variant="light"
            />
          </div>

          {bypass && (
            <div className="pt-4 border-t border-slate-800 text-center">
              <form action={adminLoginAction}>
                <input type="hidden" name="loginId" value="dev_admin" />
                <input type="hidden" name="password" value="dev_bypass" />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-[11px] text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                >
                  Dev Local Bypass (Emergency Only)
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Footer help */}
        <div className="mt-8 border-t border-slate-800/80 pt-4 text-center">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Secured via Google Identity Protocol · TRIHEX DIGITAL Root Authority
          </p>
        </div>
      </div>
    </div>
  );
}
