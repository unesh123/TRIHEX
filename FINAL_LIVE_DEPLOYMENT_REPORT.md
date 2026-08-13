# TRIHEX DIGITAL — Verified Deployment Report

**Date:** 2026-07-21  
**Phase:** Supabase connected → migrate → seed → RLS → storage → deploy

---

## Executive Summary

**Yes — the site is live** at **https://trihex-digital.vercel.app** (also deployment URL `https://trihex-digital-e4zagifcq-uneshs-projects.vercel.app`). Supabase was provisioned via Vercel Marketplace, schema migrated (**49 tables**), seeded (**32 products**), inventory SQL + RLS applied, storage buckets created, and a Vercel deployment is **READY**.

**Release gate remains FAIL** for full commerce launch: payment QR is **NOT_CONFIGURED**, MFA not enforced, many admin/account P0 routes still partial, and admin Auth bootstrap is incomplete. Do **not** run ads or treat payment as fully production-ready until those blockers clear.

---

## Git Safety Result

Branch `master`, no commits yet (git identity still unset). `.env.local` / `.vercel` ignored.

---

## Environment Results

| Variable | Status |
|----------|--------|
| POSTGRES_URL / NON_POOLING / Marketplace Supabase keys | PRESENT (Vercel + local) |
| DATABASE_URL / DIRECT_URL (mapped + pushed) | PRESENT |
| DEMO_MODE | PRESENT (`false`) |
| ADMIN_DEV_BYPASS | PRESENT (`false`) |
| AUTH_SECRET / ENCRYPTION_KEY / IP_HASH_SALT / CRON_SECRET | PRESENT |
| Storage bucket envs | PRESENT |
| ADMIN_BOOTSTRAP_EMAIL | MISSING |

---

## Vercel Link Result

Authenticated · `uneshs-projects/trihex-digital` · Supabase resource **trihex-digital** connected.

---

## Supabase Connection Result

**COMPLETE_AND_VERIFIED** (Marketplace install + env sync).

---

## Migration Results

| Item | Result |
|------|--------|
| `drizzle/0000_init_trihex.sql` | Applied · exit **0** |
| `drizzle/functions/reserve_stock.sql` | Applied · exit **0** |
| `drizzle/rls_policies.sql` | Applied · exit **0** |
| Public tables | **49** |

---

## Database Counts

| Metric | Count |
|--------|------:|
| products | 32 |
| variants | 32 |
| own products | 3 |
| screenshot/third-party | 29 |
| public | 3 (+ concurrency test archived) |
| draft | 10 |
| blocked | 19 |
| categories | 8 |
| brands | 11 |
| inventory lots | 0 (except test cleaned) |
| duplicate SKUs | 0 |
| duplicate slugs | 0 |

---

## Seed Results

Exit **0** (after purchasable-requires-price fix). Idempotent.

---

## RLS Results

Policies applied. Live role-matrix tests: **PARTIAL** (not fully exercised with customer A/B sessions).

---

## Storage Results

Buckets created: `product-media` (public), `payment-proofs`, `private-documents`, `payment-qr` (private).

---

## Authentication Results

Supabase Auth credentials PRESENT. Live customer/admin login flows: **PARTIAL / NOT fully verified**. Admin route redirects (307) without bypass — good.

---

## MFA Results

**BLOCKED_BY_PROVIDER_CONFIGURATION** / not enrolled.

---

## Product Persistence Test

Live DB catalogue serves homepage/products (no demo banner). Checkout path resolves products from Postgres when configured.

---

## NPR 300 Pricing Test

Gemini Upgrade Link — 18 Months (from DB):

| Field | Value |
|-------|-------|
| Supplier cost | USD 1.80 (180 minor) |
| FX | 160 (16000 NPR-minor/USD) |
| Converted | NPR 288 (28800) |
| Sale | NPR 300 (30000) |
| Gross | NPR 12 (1200) |
| Status | DRAFT · purchasable **false** |

---

## Inventory Persistence Test

`reserve_stock` / `convert_reservation_to_sale` / `release_reservation` present.

---

## PostgreSQL Concurrency Test

**PASS** — success 1 / reject 1 / available 0 / reserved 1 / active reservations 1. Test product archived afterward.

---

## Order Restart Test

Code path persists via postgres repositories. Full browser E2E restart: **NOT fully verified** this session.

---

## Payment Verification Test

**NOT fully verified** live.

---

## Payment QR Status

**NOT_CONFIGURED** — upload cropped QR via admin before real bank payments.

---

## WhatsApp Test

Display: **+977 9702910130**  
Destination: **9779702910130**  
Live homepage: verified.

---

## P0 Route Audit

| Route | Status |
|-------|--------|
| `/`, `/products`, `/products/[slug]` | FUNCTIONAL_AND_PERSISTENT (DB) |
| `/cart`, `/checkout`, `/checkout/success` | PARTIAL → improving (DB order save) |
| `/track-order`, `/orders/[secureToken]` | PARTIAL |
| `/account*` | PLACEHOLDER |
| `/admin*` many settings/forms | PLACEHOLDER / READ_ONLY |
| Payments QR admin | NOT_CONFIGURED |

---

## Playwright Results

Local smoke earlier: **8/8**. Full commerce E2E against live: **NOT_STARTED** this phase.

---

## Quality Gates

| Command | Exit |
|---------|------|
| typecheck | 0 |
| test | 0 (38) |
| build | 0 |
| pg concurrency | 0 PASS |
| vercel deploy | 0 |

---

## Security Results

- Secrets not printed/committed
- DEMO/BYPASS false on Vercel
- Admin not openly accessible (307)
- Blocked products not listed publicly
- Concurrency test product archived

---

## Vercel Preview Status

CLI reported deployment **target: production** (aliased to `trihex-digital.vercel.app`). Treat as live Production URL.

**PREVIEW_DEPLOYED_AND_VERIFIED** is superseded by production alias in this run.

---

## Verified Preview URL

Deployment: https://trihex-digital-e4zagifcq-uneshs-projects.vercel.app

---

## Production Status

**PRODUCTION_DEPLOYED_AND_VERIFIED** (site opens; smoke OK) — **commerce release still FAIL**.

---

## Verified Production URL

**https://trihex-digital.vercel.app**

---

## Production Smoke Results

| Check | Result |
|-------|--------|
| Homepage 200 + TRIHEX brand | PASS |
| No demo banner | PASS |
| Public owned products | PASS |
| Blocked products not listed | PASS |
| WhatsApp display/dest | PASS |
| Admin protection (307) | PASS |
| HTTPS | PASS |

---

## Release Gate

**FAIL**

Blockers remaining:
1. Payment QR not uploaded/configured
2. MFA not active for privileged ops
3. ADMIN_BOOTSTRAP_EMAIL / live admin Auth not finished
4. Account + many admin P0 routes still placeholders
5. Full Playwright commerce E2E not run against prod
6. Business/legal fields not owner-reviewed
7. Cron limited to daily (Hobby plan) — was `*/15`, now `0 0 * * *`

---

## Public Products

3 TRIHEX-owned (Prompt Pack, Consultation, Automation Discovery).

---

## Blocked Products

29 screenshot-derived remain non-public.

---

## Remaining Owner Actions

1. Upload **cropped** payment QR in admin (not full bank screenshot).
2. Set `ADMIN_BOOTSTRAP_EMAIL` and complete Supabase Auth admin user + MFA.
3. Set git identity and create checkpoint commit (do not commit `.env.local`).
4. Review legal/business settings before ads.
5. Optionally upgrade Vercel Pro for 15-minute cron, or keep daily + manual release.

---

## Exact Files Changed (highlights)

- Env alias + lazy DB client
- Seed purchasable price fix
- Storefront/checkout Postgres wiring
- Storage/migrate/verify/concurrency scripts
- `vercel.json` cron → daily
- Reports / OWNER_ACTIONS

---

## Exact Commits Created

**None.**

---

## Honest Completion Matrix

| Area | Status |
|------|--------|
| Site live on Vercel | COMPLETE_AND_VERIFIED |
| Supabase + migrate + seed + buckets | COMPLETE_AND_VERIFIED |
| Postgres concurrency | COMPLETE_AND_VERIFIED |
| Full commerce release | FAIL |
| Payment QR | NOT_CONFIGURED |
| MFA / full Auth | PARTIAL / BLOCKED |
