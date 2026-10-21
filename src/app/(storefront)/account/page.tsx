import Image from "next/image";
import Link from "next/link";
import { AccountShell } from "@/components/storefront/account-shell";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { Button } from "@/components/ui/button";
import {
  Crown,
  ShieldCheck,
  Package,
  Headphones,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  User,
  LogOut,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { getCurrentStorefrontUser } from "@/lib/auth/user-session";
import { getVipMemberByEmail } from "@/lib/vip/vip-member-store";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentStorefrontUser();

  const vipMember = user?.email ? await getVipMemberByEmail(user.email) : null;

  return (
    <AccountShell
      title="Customer Intelligence & Account"
      description="Manage subscriptions, track orders, and activate your VIP access."
    >
      {user ? (
        /* Authenticated State */
        <div className="mt-6 space-y-6">
          {/* Profile Overview Card */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[var(--border)] bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-indigo-400 bg-slate-800 shadow-md">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.fullName || "User Avatar"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-lg text-indigo-300">
                    {user.fullName?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                {vipMember && (
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-400 p-1 text-slate-950 shadow">
                    <Crown className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{user.fullName}</h3>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                    Google Verified
                  </span>
                </div>
                <p className="text-xs text-slate-300">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <form action="/api/auth/signout" method="POST">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800/80 text-xs text-slate-200 hover:bg-slate-700"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" /> Sign Out
                </Button>
              </form>
            </div>
          </div>

          {/* VIP Status Card */}
          {vipMember && vipMember.status === "ACTIVE" ? (
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 p-6 text-slate-100 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-400">
                      <Sparkles className="h-3 w-3" /> TRIHEX VIP ACTIVE
                    </span>
                    <h4 className="text-lg font-bold text-white">
                      {vipMember.tierName || "Exclusive VIP Pass"}
                    </h4>
                  </div>
                </div>
                <Link
                  href="/vip"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:scale-105 transition duration-150"
                >
                  Enter VIP Vault <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                Your account has full clearance for private chat rooms, 564+ verified developer offers, Lovable unmetered scripts, and direct founder hotline.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono text-slate-400 border-t border-slate-800 pt-3">
                <span>STATUS: <span className="text-emerald-400 font-bold">{vipMember.status}</span></span>
                <span>EXPIRES: <span className="text-amber-300 font-bold">{vipMember.isLifetime ? "PERMANENT LIFETIME" : vipMember.expiresAt ? vipMember.expiresAt.slice(0, 10) : "Active"}</span></span>
              </div>
            </div>
          ) : vipMember && vipMember.status === "PENDING_VERIFICATION" ? (
            <div className="rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-50 via-white to-amber-50/30 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                    <span>VIP Request Pending Admin Approval</span>
                  </div>
                  <h4 className="mt-2 text-base font-bold text-slate-900">
                    Your VIP Access Request is Under Review
                  </h4>
                  <p className="mt-1 text-xs text-slate-600">
                    Payment verification submitted. Trix (Admin) is reviewing your payment and will activate your 👑 <strong>VIP Tag</strong> shortly.
                  </p>
                </div>
                <Link
                  href="/vip"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-sm transition"
                >
                  Check VIP Gateway <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/60 px-3 py-1 text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    <Crown className="h-3.5 w-3.5 text-amber-600" />
                    <span>VIP Vault Available</span>
                  </div>
                  <h4 className="mt-2 text-base font-bold text-slate-900">
                    Unlock Private VIP Community &amp; 564+ Advanced AI Methods
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Get access to private mastermind chatrooms, Lovable builders, and developer blueprints.
                  </p>
                </div>
                <Link
                  href="/vip"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-sm transition"
                >
                  Request VIP Access <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/track-order"
              className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-4 transition hover:border-indigo-400 hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-indigo-600">
                <Package className="h-4 w-4" />
                <span className="font-semibold text-sm text-slate-900">Track Orders</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Check activation &amp; delivery progress</p>
            </Link>

            <Link
              href="/account/orders"
              className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-4 transition hover:border-indigo-400 hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-semibold text-sm text-slate-900">Purchased Licences</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">View active warranties &amp; credentials</p>
            </Link>

            <Link
              href="/contact"
              className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-4 transition hover:border-indigo-400 hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-violet-600">
                <Headphones className="h-4 w-4" />
                <span className="font-semibold text-sm text-slate-900">Priority Support</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Direct WhatsApp support (+977 9702910130)</p>
            </Link>
          </div>
        </div>
      ) : (
        /* Guest / Unauthenticated State with Authentic Google Sign In */
        <div className="mt-8 mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
            <User className="h-7 w-7" />
          </div>

          <h3 className="mt-4 font-[family-name:var(--font-sora)] text-2xl font-bold text-slate-900">
            Sign In with Google
          </h3>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Link your orders, download invoice receipts, claim warranty replacements, and link your VIP Vault clearance in 1-click.
          </p>

          <div className="mt-6">
            <GoogleAuthButton
              label="Sign in with Google"
              nextUrl="/account"
              variant="light"
            />
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400">
            <span>Don&apos;t have an account? Google Sign-In automatically creates your verified profile.</span>
            <div className="mt-2 flex justify-center gap-4 text-indigo-600 font-semibold">
              <Link href="/track-order" className="hover:underline">Track without login</Link>
              <span>•</span>
              <Link href="/contact" className="hover:underline">Need Help?</Link>
            </div>
          </div>
        </div>
      )}
    </AccountShell>
  );
}
