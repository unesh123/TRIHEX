"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { appendAuditEvent } from "@/lib/audit/log";
import {
  ADMIN_SESSION_COOKIE,
  buildAdminSessionCookieValue,
} from "@/lib/admin/session-cookie";
import { isAdminDevBypassEnabled } from "@/lib/auth/admin-gate";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { isOwnerEmail } from "@/lib/auth/owner";

export async function adminLoginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    redirect("/admin/login?error=email_required");
  }

  if (isAdminDevBypassEnabled()) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, buildAdminSessionCookieValue(email), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    await appendAuditEvent({
      action: "ADMIN_LOGIN",
      actorId: "dev-bypass-admin",
      entityType: "admin_session",
      metadata: { email, bypass: true },
    });
    redirect("/admin");
  }

  if (!password) {
    redirect("/admin/login?error=password_required");
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      redirect("/admin/login?error=invalid_credentials");
    }

    const mustReset = Boolean(
      data.user.app_metadata?.must_reset_password ||
        data.user.user_metadata?.must_reset_password,
    );
    const { isMfaHardRequired } = await import("@/lib/auth/mfa-policy");
    const mfaEnabled = Boolean(
      data.user.app_metadata?.mfa_enabled ||
        (data.user.factors ?? []).some(
          (f) => f.status === "verified" || f.factor_type === "totp",
        ),
    );

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, buildAdminSessionCookieValue(email), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    await appendAuditEvent({
      action: "ADMIN_LOGIN",
      actorId: data.user.id,
      entityType: "admin_session",
      metadata: { email },
    });

    if (mustReset) {
      redirect("/admin/login?reset=required");
    }
    // Only hard-redirect when ADMIN_MFA_REQUIRED is set — otherwise allow ops
    if (!mfaEnabled && isMfaHardRequired()) {
      redirect("/admin/settings/security?mfa=required");
    }

    redirect("/admin");
  } catch {
    redirect("/admin/login?error=auth_unavailable");
  }
}

export async function adminRequestPasswordResetAction(
  formData: FormData,
): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/admin/login?error=email_required");

  if (!isOwnerEmail(email)) {
    // Do not reveal whether other emails exist
    redirect("/admin/login?reset=sent");
  }

  try {
    const supabase = await createSupabaseServerClient();
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://trihexdigital.shop"}/admin/login?reset=1`;
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  } catch {
    // swallow
  }
  redirect("/admin/login?reset=sent");
}

export async function adminLogoutAction(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
