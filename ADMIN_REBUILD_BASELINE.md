# TRIHEX DIGITAL — Admin Rebuild Baseline

**Recorded:** 2026-07-25  
**Live domain:** https://trihexdigital.shop  
**Admin:** https://trihexdigital.shop/admin/login  
**Vercel project:** `trihex-digital` (existing — do not create another)

## Production rollback target

| Field | Value |
|-------|--------|
| Production deployment URL | `https://trihex-digital-7233rit9r-uneshs-projects.vercel.app` |
| Deployment ID | `dpl_DkQtbda8DPs1WSHk86J7erhNrxr2` |
| Aliased to | `trihexdigital.shop` |
| Git HEAD (local) | `597e826` — Add July 2026 stock products with unique covers |

Preserve this deployment for rollback via Vercel Instant Rollback / redeploy previous.

## Secrets / Git ignore (confirmed)

Ignored: `.env`, `.env.local`, `.env*`, `.vercel`, `/secrets/`, `**/payment-proofs/`.

## Visible sidebar items (before rebuild)

From `src/components/admin/nav-config.ts` + hardcoded Marketing / Payment methods:

Overview · Orders · Payments · Fulfillment · Products · Import · Variants · Inventory · Lots · Movements · Suppliers · Compliance · Data verification · Pricing · FX rates · Promotions · Customers · Warranties · Refunds · Support · Reviews · Reports · Audit log · Team · Settings · Legal · Integrations · System · Marketing · Payment methods

## Implemented (database-backed / usable)

| Module | Route | Tables / sources |
|--------|-------|------------------|
| Dashboard KPIs | `/admin` | orders, payments, products |
| Products list/edit/create | `/admin/products*` | products, variants, product_media |
| Import cost→NPR | `/admin/products/import` | products |
| Pricing desk | `/admin/pricing` | products / variants |
| Inventory qty | `/admin/inventory` | products.seed_visible_quantity |
| Orders list + detail | `/admin/orders*` | orders, order_items, manual_payment_submissions |
| Payment review | `/admin/payments/review` | manual_payment_submissions, payments |
| Fulfillment checklist | on order detail | orders.fulfillment_* |
| Reviews | `/admin/reviews` | reviews |
| Audit (repo) | `/admin/audit` | audit_logs / in-memory fallback |
| Login + MFA UI | `/admin/login`, settings/security | Supabase Auth, profiles |

## Partially implemented

| Module | Gap |
|--------|-----|
| Payment methods | Policy text only — QR is static file swap |
| Compliance reviews | Seed-only (`seed-products`) |
| Fulfillment nav page | Empty shell — checklist only on order detail |
| Settings/security | MFA enroll UI; optional via `ADMIN_MFA_OPTIONAL` |
| Sidebar health | Hardcoded “demo mode” even when DB connected |
| Payments list | “in-memory demo” copy |

## Empty shells (must hide or complete)

Fulfillment (page) · Variants · Lots · Movements · Reconciliation · Suppliers · Customers · Warranties · Refunds · Support · Reports · Team · Legal · Integrations · System · Promotions · Marketing (+ coupons/campaigns/media) · most Settings subpages · FX rates (static note)

## Seed-only pages

- `/admin/compliance/reviews` — `productsNeedingVerification()` from seed

## Environment-dependent controls

- `ADMIN_DEV_BYPASS` — forbidden in production (`proxy.ts`, `admin-gate.ts`)
- `ADMIN_MFA_OPTIONAL` — default allows login without MFA
- `ADMIN_BOOTSTRAP_EMAIL` — bootstrap SUPER_ADMIN identity (not password)
- Storage: `PRODUCT_MEDIA_STORAGE_BUCKET`, `PAYMENT_PROOF_STORAGE_BUCKET`, `PAYMENT_QR_STORAGE_BUCKET`
- WhatsApp: `NEXT_PUBLIC_BUSINESS_WHATSAPP_*`

## Security limitations (pre-rebuild)

1. MFA not enforced when `ADMIN_MFA_OPTIONAL` ≠ false  
2. Many nav links to empty modules  
3. False “demo / DB not connected” footer  
4. QR not admin-managed  
5. Compliance not reading live Postgres  
6. Team roles UI missing (permissions exist in code)  
7. Stub cookie session still allowed outside production  

## Rebuild rule

P0: hide unfinished nav · fix health messaging · live fulfillment queue · QR upload · live compliance · MFA enforce for privileged · audit honesty · no Production deploy before Preview verification.
