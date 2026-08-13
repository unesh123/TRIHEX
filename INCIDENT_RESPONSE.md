# Incident Response

Lightweight incident playbook for TRIHEX DIGITAL v0.1.0. Expand when production is live.

## Severity levels

| Level | Examples | Response time |
|-------|----------|---------------|
| **S1 Critical** | Payment verify broken, data breach, site down | Immediate |
| **S2 High** | Checkout failures, oversell, admin lockout | Same business day |
| **S3 Medium** | WhatsApp template error, stale FX, single product mispriced | 1–2 business days |
| **S4 Low** | UI typo, non-blocking admin shell | Backlog |

## S1 — Site down / health fail

1. Check Vercel/host status and last deploy
2. Hit `/api/health` — note `database` / `supabase` flags
3. Roll back deployment if recent release caused failure
4. Communicate on WhatsApp auto-reply if extended outage

## S1 — Suspected data breach

1. Rotate **all** secrets: `AUTH_SECRET`, DB password, `CRON_SECRET`, payment keys, Supabase service role
2. Disable `ADMIN_DEV_BYPASS` everywhere
3. Review `/admin/audit` and DB `audit_logs` for anomalous actions
4. Preserve logs before rotation where legally allowed
5. Notify affected customers if PII exposed — grievance officer per `/grievance`

## S2 — Overselling / inventory mismatch

1. Pause variant sales (`PAUSED` stock state or unpublish)
2. Compare ledger movements vs lots in `/admin/inventory/reconciliation`
3. Run `release_reservation` for stuck ACTIVE reservations
4. Contact affected customers — offer refund or delay

## S2 — Payment verified in error

1. Do **not** fulfill if caught before delivery
2. Finance reverses verify status; document in audit with reason
3. If fulfilled, follow refund policy and revoke access if possible

## S2 — Compliance product sold in error

1. Unpublish product immediately
2. Block checkout in code if gate bypass suspected
3. Review `evaluatePublication()` path and seed/catalog data
4. Refund if payment taken

## S3 — WhatsApp abuse / phishing using our number

1. Warn customers via website banner — do not share OTPs/passwords
2. Report impersonation to Meta WhatsApp Business if applicable
3. Review [WHATSAPP_OPERATIONS.md](./WHATSAPP_OPERATIONS.md) staff adherence

## Post-incident

1. Timeline document (what happened, root cause, fix)
2. Update runbook or code guard if systemic
3. Optional entry in [CHANGELOG.md](./CHANGELOG.md)

## Contacts

- Technical: repository maintainers
- Customer comms: WhatsApp +977 9702910130
- Legal/grievance: storefront `/grievance` contacts

## Prevention

- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) before each production deploy
- `npm test` + typecheck in CI
- Never enable dev bypass in production
