import { AdminHeader } from "@/components/admin/admin-header";
import { MfaSetupPanel } from "@/components/admin/mfa-setup-panel";
import { isMfaHardRequired } from "@/lib/auth/mfa-policy";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ mfa?: string }>;
}) {
  const params = await searchParams;
  const hard = isMfaHardRequired();
  const required = params.mfa === "required" || hard;

  return (
    <>
      <AdminHeader
        title="Security / MFA"
        description="Protect the owner account with an authenticator app. Recommended for all production admins."
      />
      {required ? (
        <div className="mb-6 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-text">
          {hard
            ? "MFA is required on this environment. Enroll below to continue using admin."
            : "Finish MFA setup below for stronger account protection. You can still use admin if enrollment is not forced."}
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm text-text-muted">
          MFA is recommended. Enable it when you are ready — it will not lock you
          out unless hard-required in environment settings.
        </div>
      )}
      <MfaSetupPanel />
    </>
  );
}
