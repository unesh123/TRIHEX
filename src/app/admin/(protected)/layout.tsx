import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/sidebar";
import { checkAdminSession } from "@/lib/auth/admin-gate";
import { getSystemHealth } from "@/lib/admin/system-health";
import { adminLogoutAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import {
  isMfaHardRequired,
  isPrivilegedAdminRole,
} from "@/lib/auth/mfa-policy";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

async function adminHasMfaEnrolled(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;
    if (userData.user.app_metadata?.mfa_enabled) return true;
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totp = factors?.totp ?? [];
    return totp.some((f) => f.status === "verified");
  } catch {
    return false;
  }
}

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gate = await checkAdminSession(await headers());

  if (!gate.ok) {
    redirect("/admin/login");
  }

  const { session } = gate;
  const health = await getSystemHealth();
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "";

  // Hard MFA lock only when explicitly required — never lock out by default
  if (
    !session.bypass &&
    isMfaHardRequired() &&
    isPrivilegedAdminRole(session.role) &&
    !pathname.startsWith("/admin/settings/security")
  ) {
    const enrolled = await adminHasMfaEnrolled();
    if (!enrolled) {
      redirect("/admin/settings/security?mfa=required");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <AdminSidebar
        role={session.role}
        email={session.email}
        bypass={session.bypass}
        health={health}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-surface/50 px-4 py-2 sm:px-6">
          <p className="truncate text-xs text-text-muted">
            {health.labels.environment}
            {health.database === "ok" ? " · DB connected" : " · DB unavailable"}
          </p>
          <form action={adminLogoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
