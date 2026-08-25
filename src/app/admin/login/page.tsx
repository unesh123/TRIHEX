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

export const metadata = {
  title: "Admin login",
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(12,88,119,.12),transparent_28rem),radial-gradient(circle_at_88%_12%,rgba(103,87,217,.1),transparent_24rem),var(--page)] px-4 py-10">
      <div className="relative w-full max-w-lg rounded-[1.5rem] border border-white/80 bg-white/92 p-6 shadow-[0_28px_70px_rgba(13,28,43,.14)] backdrop-blur-xl sm:p-8">
        <Logo href="/" size="md" />
        <div className="mt-6 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_0_4px_rgba(8,116,93,.12)]" /><span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">Secure operator access</span></div>
        <h1 className="mt-3 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-3xl">
          Admin sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Sign in with your admin email and password. Manage products, prices,
          stock, and status — changes go live on the storefront.
        </p>

        <p className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--page-soft)]/55 px-3.5 py-3 text-xs leading-relaxed text-[var(--text-muted)]">
          Use your authorized TRIHEX operations account. Admin access is protected,
          audited, and limited by role.
          {` Your owner recovery email is ${maskEmail(bootstrapEmail)}.`}
        </p>

        {bypass ? (
          <div className="mt-4 rounded-lg border border-[var(--warning)]/40 bg-[var(--warning-soft)] px-3 py-2 text-xs text-[var(--warning)]">
            Dev bypass active (local only). Never enable in Preview/Production.
          </div>
        ) : null}

        {params.reset === "sent" ? (
          <p className="mt-4 text-sm text-[var(--success)]">
            If the account exists, a password reset link was sent. Check your inbox.
          </p>
        ) : null}
        {params.reset === "required" ? (
          <p className="mt-4 text-sm text-[var(--warning)]">
            Password reset required. Use “Send reset link” below, then sign in
            with your new password.
          </p>
        ) : null}
        {params.reset === "1" ? (
          <p className="mt-4 text-sm text-[var(--success)]">
            Password updated. Sign in with your new password, then finish MFA.
          </p>
        ) : null}
        {params.error ? (
          <p className="mt-4 text-sm text-[var(--danger)]">Sign-in failed. Check inputs.</p>
        ) : null}

        <form action={adminLoginAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={bootstrapEmail}
              required
              autoComplete="username"
            />
          </div>
          {!bypass ? (
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
              />
            </div>
          ) : (
            <input type="hidden" name="password" value="dev-bypass" />
          )}
          <Button type="submit" className="w-full">
            {bypass ? "Continue (dev bypass)" : "Sign in"}
          </Button>
        </form>

        {!bypass ? (
          <form action={adminRequestPasswordResetAction} className="mt-5 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--page-soft)]/45 p-4">
            <p className="text-xs text-[var(--text-muted)]">
              First login: request a reset link, choose your own password, then
              enable MFA under Settings → Security.
            </p>
            <Input
              id="reset-email"
              name="email"
              type="email"
              defaultValue={bootstrapEmail}
              placeholder="Authorized admin email"
              required
              autoComplete="email"
            />
            <Button type="submit" variant="secondary" className="w-full">
              Send password reset link
            </Button>
          </form>
        ) : null}

        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          <Link href="/" className="text-[var(--primary)] hover:underline">
            Back to storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
