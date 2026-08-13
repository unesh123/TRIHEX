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
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const bootstrapMissing = !bootstrapEmail;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--page)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-8 shadow-xl">
        <Logo href="/" size="md" />
        <h1 className="mt-6 font-[family-name:var(--font-sora)] text-xl font-semibold text-[var(--text)]">
          Admin sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Sign in with your admin email and password. Manage products, prices,
          stock, and status — changes go live on the storefront.
        </p>

        {bootstrapMissing ? (
          <div className="mt-4 rounded-lg border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-3 py-2 text-xs text-[var(--danger)]">
            ADMIN_BOOTSTRAP_EMAIL is not configured. Set it in .env.local and
            Vercel, then run{" "}
            <code className="rounded bg-white px-1">npx tsx scripts/bootstrap-admin.ts</code>.
          </div>
        ) : (
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            Bootstrap email: {maskEmail(bootstrapEmail)}
          </p>
        )}

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
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={bootstrapEmail ?? ""}
              required
              autoComplete="username"
            />
          </div>
          {!bypass ? (
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
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
          <form action={adminRequestPasswordResetAction} className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
            <p className="text-xs text-[var(--text-muted)]">
              First login: request a reset link, choose your own password, then
              enable MFA under Settings → Security.
            </p>
            <input type="hidden" name="email" value={bootstrapEmail ?? ""} />
            <Button type="submit" variant="secondary" className="w-full" disabled={bootstrapMissing}>
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
