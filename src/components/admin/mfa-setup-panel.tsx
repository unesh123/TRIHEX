"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}

export function MfaSetupPanel() {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [alreadyEnabled, setAlreadyEnabled] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getBrowserClient();
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const verified = (factors?.totp ?? []).some(
          (f) => f.status === "verified",
        );
        if (!cancelled) {
          setAlreadyEnabled(verified);
          setChecked(true);
        }
      } catch {
        if (!cancelled) setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enroll() {
    setBusy(true);
    setMessage(null);
    try {
      const supabase = getBrowserClient();
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "TRIHEX Admin",
      });
      if (error) throw error;
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setMessage("Scan the QR with your authenticator app, then enter a code.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "MFA enroll failed");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!factorId || !code) return;
    setBusy(true);
    setMessage(null);
    try {
      const supabase = getBrowserClient();
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;
      const verified = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code,
      });
      if (verified.error) throw verified.error;
      await supabase.auth.updateUser({
        data: { mfa_enabled: true, must_reset_password: false },
      });
      setAlreadyEnabled(true);
      setMessage("MFA enabled. Redirecting to dashboard…");
      window.location.href = "/admin";
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "MFA verify failed");
    } finally {
      setBusy(false);
    }
  }

  if (!checked) {
    return (
      <div className="rounded-xl border border-border bg-white p-5 text-sm text-text-muted">
        Checking MFA status…
      </div>
    );
  }

  if (alreadyEnabled && !qr) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-5">
        <h2 className="font-semibold text-text">MFA is enabled</h2>
        <p className="mt-2 text-sm text-text-muted">
          Authenticator app is linked to this admin account. Keep your device
          safe — you will need it for future sign-ins when MFA challenge is on.
        </p>
        <Button href="/admin" variant="secondary" className="mt-4" size="sm">
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h2 className="font-semibold text-text">Multi-factor authentication</h2>
      <p className="mt-2 text-sm text-text-muted">
        Recommended for owner accounts. Use Google Authenticator, Authy, or
        1Password TOTP.
      </p>
      {message ? (
        <p className="mt-3 text-sm text-text-muted">{message}</p>
      ) : null}
      {qr ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qr} alt="MFA QR code" className="mt-4 h-48 w-48" />
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={enroll} disabled={busy}>
          {qr ? "Restart setup" : "Start MFA setup"}
        </Button>
        {factorId ? (
          <>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              className="w-36"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <Button
              type="button"
              onClick={verify}
              disabled={busy || code.length < 6}
            >
              Verify & enable
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
