# Security

## HTTP security headers

Applied on all matched routes via `src/proxy.ts` (Next.js proxy / middleware pattern):

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, microphone, geolocation disabled |
| `Content-Security-Policy` | Restrictive default-src 'self'; img/connect https |

Admin routes redirect unauthenticated users to `/admin/login` unless `ADMIN_DEV_BYPASS=true`.

## Authentication

| Surface | Current behavior |
|---------|------------------|
| Admin | Cookie `trihex_admin_session`; dev bypass via env |
| Customer account | UI shell; Supabase Auth planned |
| Cron | `Authorization: Bearer ${CRON_SECRET}` |

**Never set `ADMIN_DEV_BYPASS=true` in production.**

Planned: Supabase Auth session lookup replacing stub in `checkAdminSession()`.

## RBAC

Roles: `SUPPORT`, `FULFILLMENT`, `CATALOG_MANAGER`, `FINANCE`, `COMPLIANCE_REVIEWER`, `ADMIN`, `SUPER_ADMIN`.

Permissions enforced via `hasPermission()` / `assertPermission()` — e.g. only `FINANCE` and above review payments; `SUPPORT` cannot.

Catalog managers **cannot approve their own compliance uploads**.

## Secrets management

Store in `.env.local` / hosting env — never commit:

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | PostgreSQL |
| `AUTH_SECRET` | Session signing (≥32 chars) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase |
| `ESEWA_SECRET_KEY`, `KHALTI_SECRET_KEY` | Payment gateways |
| `EMAIL_PROVIDER_API_KEY` | Transactional email |
| `CRON_SECRET` | Cron route auth |
| `ENCRYPTION_KEY` | Payload encryption (fulfillment) |
| `IP_HASH_SALT` | Privacy-preserving IP hashing |

Validated (optional fields) in `src/lib/env.ts`.

## API guards

- `requireAdminApi()` — admin JSON routes
- `requireCronSecret()` — scheduled jobs

## Audit and logging

- `appendAuditEvent()` redacts keys matching password/secret/token patterns
- Development logs audit actions to console
- Avoid logging payment proof binaries

## WhatsApp safety

Message builder blocks sensitive content before URL generation (`src/lib/whatsapp/index.ts`).

## Dependencies

Run `npm audit` before releases. Keep Next.js and Drizzle updated per [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md).

## Reporting

Security incidents: see [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md).
