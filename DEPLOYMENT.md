# Deployment

**Status: BLOCKED** — do not deploy to production until credentials, migrations, and [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) are complete.

This project is **not live** as of v0.1.0. Local demo mode works without a database; production requires full wiring.

## Target platform

**Vercel** (Next.js 16 compatible) is the intended host. No production deployment has been configured in this repository.

## Prerequisites (before first deploy)

| Item | Required |
|------|----------|
| PostgreSQL | `DATABASE_URL`, migrations applied |
| `reserve_stock.sql` | Applied after schema migration |
| `ADMIN_DEV_BYPASS` | **`false` or unset** |
| `AUTH_SECRET` | ≥32 random characters |
| Supabase (if used) | URL + keys |
| `CRON_SECRET` | For reservation release job |
| Payment QR assets | Uploaded via admin, not in git |
| Domain + SSL | See [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) |

## Vercel preparation

1. Connect Git repository to Vercel project
2. Set environment variables from `.env.example` (production values)
3. Build command: `npm run build`
4. Output: Next.js default
5. Configure cron (Vercel Cron or external) → `GET /api/cron/release-reservations` with `Authorization: Bearer $CRON_SECRET`

## Build locally

```bash
npm run build
npm run start
```

Verify `/api/health` shows `database: configured` when `DATABASE_URL` is set.

## Database migration (staging first)

```bash
# Generate if schema changed
npm run db:generate

# Apply on staging only — NOT production until approved
npm run db:migrate

# Apply SQL functions manually or via generated migration
# drizzle/functions/reserve_stock.sql
```

**No production migrate has been run yet.**

## Blockers for go-live

- [ ] Order/payment/inventory persistence wired to Drizzle (not in-memory)
- [ ] Real admin auth (Supabase) — dev bypass disabled
- [ ] Compliance-reviewed PUBLIC catalog only
- [ ] Manual payment review staffed
- [ ] Legal pages reviewed for Nepal e-commerce
- [ ] Backup and restore tested

## Rollback

- Vercel instant rollback to previous deployment
- Database: restore from snapshot before failed migration — **test on staging**

## Observability

- Optional `SENTRY_DSN` for error tracking
- Health endpoint for uptime checks

## Honesty note

Claiming "live" or customer-facing production status is **not accurate** for this recovery build until the blockers above are cleared.
