# Architecture

TRIHEX DIGITAL is a monolithic Next.js 16 application: storefront routes under `src/app/(storefront)/`, admin under `src/app/admin/`, and API routes under `src/app/api/`.

## High-level diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Storefront    │────▶│  API routes      │────▶│  Domain libs    │
│  (React pages)  │     │  checkout, pay   │     │  pricing, orders│
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                         │                         │
         │                         ▼                         ▼
         │               ┌──────────────────┐     ┌─────────────────┐
         └──────────────▶│  proxy.ts        │     │  PostgreSQL     │
                         │  headers + admin │     │  (when configured)
                         └──────────────────┘     └─────────────────┘
                                   │
                         Demo mode when DATABASE_URL absent:
                         in-memory orders, payments, inventory, audit
```

## Storefront

- **Routes:** Home, catalog (`/products`, `/categories`, `/collections`), product detail, cart, checkout, order tracking (`/track-order`, `/orders/[secureToken]`), legal pages, account shell.
- **Catalog source:** `src/lib/catalog/demo-catalog.ts` reads from `src/db/seed-data.ts` (32 products: 29 screenshot-derived drafts + 3 TRIHEX-owned PUBLIC demos).
- **Checkout:** `POST /api/checkout` → `createOrder()` recomputes prices server-side and saves to in-memory `order-store` when DB is absent.
- **WhatsApp:** Floating button and product/checkout links via `src/lib/whatsapp` — opens `wa.me` with pre-filled **safe** messages only.

## Admin

- **Auth:** Cookie `trihex_admin_session`; local dev uses `ADMIN_DEV_BYPASS=true` (`src/lib/auth/admin-gate.ts`, `src/app/admin/login/`).
- **RBAC:** Roles and permissions in `src/lib/auth/permissions.ts` (SUPPORT, FULFILLMENT, FINANCE, COMPLIANCE_REVIEWER, ADMIN, SUPER_ADMIN).
- **Sections:** Dashboard shell with product, pricing, inventory, payment review, compliance, marketing, settings pages (`src/lib/admin/sections.ts`). Many admin pages are **UI shells** backed by seed/demo data until DB is connected.

## Database schema

Full Drizzle schema: `src/db/schema.ts`. Major domains:

- Profiles, customers, business settings
- Catalog: brands, categories, products, variants, media
- Compliance fields on products (status, authorization type, vendor proof)
- Inventory: lots, movements, reservations
- Orders, order items, status history
- Payments, manual payment submissions
- Fulfillment, redeem codes, secure delivery messages
- Support, warranties, refunds, audit logs, FX rates, feature flags

Client: `src/db/index.ts` — returns `null` when `DATABASE_URL` is unset.

## Pricing

- Engine: `src/lib/pricing/engine.ts` — formula or `MANUAL_ONLY` override.
- Contribution preview: `src/lib/pricing/contribution.ts` — labels `HEALTHY | LOW_MARGIN | BELOW_POLICY | ESTIMATED_LOSS` (never "guaranteed profit").
- Money: `src/lib/money/index.ts` — integer minor units, basis points, FX conversion.

## Inventory

- Ledger concepts: `src/lib/inventory/ledger.ts`
- Reservations: `src/lib/inventory/reserve.ts` (in-memory + mutex for tests)
- Production SQL: `drizzle/functions/reserve_stock.sql` (`reserve_stock`, `convert_reservation_to_sale`, `release_reservation`)

## Payments

- **Active path:** Manual QR — eSewa, Khalti, bank transfer (`ESEWA_MANUAL`, `KHALTI_MANUAL`, `BANK_TRANSFER`).
- Workflow: `src/lib/payments/manual.ts` → in-memory store (`src/lib/payments/store.ts`).
- Gateway stubs exist (`esewa.ts`, `khalti.ts`) but are not the primary checkout flow.

## WhatsApp (communication only)

- Link builder: `src/lib/whatsapp/index.ts`
- Rejects messages containing passwords, OTPs, license keys, redeem codes, supplier costs, or DB UUIDs.
- **Does not** update order or payment state. Staff must use admin payment review.

## ORM choice: Drizzle

Drizzle was chosen for **SQL-first, transactional** inventory and order workflows:

- Explicit PostgreSQL enums and check constraints (e.g. `PUBLIC` requires `APPROVED` compliance).
- Atomic stock functions in raw SQL with `FOR UPDATE` locking.
- Type-safe schema shared between migrations and application code.
- Lighter than a heavy abstraction layer for finance/inventory correctness.

Supabase provides optional Auth and storage; business logic stays in the Next.js app layer.

## External integrations (planned / optional)

- Supabase Auth for admin and customer sessions
- eSewa / Khalti gateways (env vars present, manual flow implemented first)
- Email provider (`EMAIL_PROVIDER_API_KEY`)
- Sentry, analytics adapter (`ANALYTICS_KEY`)

## Health check

`GET /api/health` returns `database: configured | not_connected` and `supabase: configured | not_connected`.
