# Data Retention

Policy for TRIHEX DIGITAL data handling. v0.1.0 demo mode retains little persistently — this documents **intended production policy** aligned with schema design.

## Demo mode (current)

Without `DATABASE_URL`:

| Data | Retention |
|------|-----------|
| Orders, payments, inventory | Until Node process restart |
| Audit events | Last 500 in memory |

**No long-term retention** in demo mode.

## Production categories (planned)

| Data type | Retention | Notes |
|-----------|-----------|-------|
| Orders + order items | 7 years | Tax/accounting (Nepal rules — confirm with accountant) |
| Manual payment proofs | 7 years | Secure storage; not in git |
| Audit logs | 7 years | Immutable append |
| Customer profile | Until deletion request + order retention met | |
| Marketing consent | Until withdrawn | Honor opt-out |
| Support tickets | 3 years after close | |
| WhatsApp chat | Business device policy; minimize PII | Not stored in app DB by default |
| IP hashes | 90 days | `customer_ip_hash`, `ip_hash` on audit |
| Session cookies | 7 days admin session | httpOnly |
| Secure delivery messages | Until `expires_at` + 30 days | Encrypted payload |
| Redeem codes | Life of code + order retention | Encrypted at rest |

## Customer rights

- Access/delete requests via `/grievance` or email (configure in business settings)
- Deletion may be delayed where law requires order retention
- Export: manual process until automated DSAR tooling exists

## Minimization

- Checkout collects name, email, phone — required for fulfillment
- Do not store passwords or third-party credentials in plaintext
- Audit metadata sanitizer redacts secret-like keys (`src/lib/audit/log.ts`)
- WhatsApp link builder blocks sensitive message content

## Backups

- PostgreSQL: daily automated backups when hosted (provider TBD)
- Test restore quarterly on staging
- Encrypt backups at rest

## Deletion procedure

1. Verify identity
2. Anonymize PII on orders where retention required (replace email/name with hash)
3. Delete revocable tokens and marketing identifiers
4. Log action in audit trail

## Related

- [SECURITY.md](./SECURITY.md)
- Storefront `/privacy` page
