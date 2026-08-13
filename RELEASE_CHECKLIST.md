# Release Checklist

Complete before any **production** release. v0.1.0 recovery build is **not release-ready** for customers.

## Code quality

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes (all Vitest suites)
- [ ] `npm run build` succeeds locally
- [ ] No `ADMIN_DEV_BYPASS=true` in production env
- [ ] No secrets in git history for this release

## Database

- [ ] `DATABASE_URL` set on production/staging
- [ ] `npm run db:generate` — migrations committed
- [ ] Migrations applied on **staging** first
- [ ] `drizzle/functions/reserve_stock.sql` applied
- [ ] Seed run only for approved catalogue rows
- [ ] Backup taken immediately before production migrate
- [ ] `/api/health` reports `database: configured`

## Auth & security

- [ ] Supabase Auth (or equivalent) wired — dev bypass disabled
- [ ] `AUTH_SECRET` ≥ 32 random characters
- [ ] `CRON_SECRET` set; cron job scheduled
- [ ] `ENCRYPTION_KEY` and `IP_HASH_SALT` set if using secure delivery
- [ ] Security headers verified on production URL
- [ ] Admin roles assigned per least privilege

## Commerce

- [ ] Only `APPROVED` + `PUBLIC` products purchasable
- [ ] Blocked categories remain blocked (Cursor, ChatGPT consumer, etc.)
- [ ] Manual payment QR assets uploaded — not in repo
- [ ] Finance staff trained on payment verify workflow
- [ ] Order/payment persistence uses DB — not in-memory stores
- [ ] Reservation TTL cron running

## Compliance & legal

- [ ] Terms, privacy, refund, delivery policies reviewed for Nepal
- [ ] Grievance officer contacts accurate on `/grievance`
- [ ] Trademark disclaimer present on storefront
- [ ] No screenshot-import claims marked verified without review
- [ ] `adReady` false on all non-approved ad targets

## WhatsApp & support

- [ ] `NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER=9779702910130`
- [ ] Staff read [WHATSAPP_OPERATIONS.md](./WHATSAPP_OPERATIONS.md)
- [ ] Quick replies agreed — no "payment confirmed" without verify

## Infrastructure

- [ ] Vercel project env vars match `.env.example` keys
- [ ] `NEXT_PUBLIC_APP_URL` matches production domain
- [ ] Domain DNS verified — see [DOMAIN_SETUP.md](./DOMAIN_SETUP.md)
- [ ] Optional: `SENTRY_DSN` for errors

## Post-deploy smoke test

- [ ] Homepage and product page load
- [ ] Checkout with owned demo product
- [ ] Manual payment submit + admin verify flow
- [ ] Track order page shows updated status
- [ ] Admin login without bypass
- [ ] WhatsApp link opens with safe template

## Sign-off

| Role | Name | Date |
|------|------|------|
| Owner | | |
| Compliance | | |
| Finance | | |
| Technical | | |

## Rollback plan documented

- [ ] Previous Vercel deployment ID noted
- [ ] DB restore procedure tested on staging

---

**Reminder:** Claiming live customer-facing production without this checklist is inaccurate for the recovery build.
