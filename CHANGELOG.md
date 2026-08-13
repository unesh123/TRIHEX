# Changelog

All notable changes to TRIHEX DIGITAL are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] — 2026-07-21

### Recovery build

Initial recovery release — storefront, admin shell, domain logic, and documentation. **Not production-deployed.**

### Added

- Next.js 16 App Router storefront with Nepal-focused legal and policy pages
- Admin control center with RBAC definitions and section navigation
- Drizzle PostgreSQL schema (`src/db/schema.ts`) — full commerce/compliance model
- SQL inventory functions (`drizzle/functions/reserve_stock.sql`) — not yet migrated to prod
- Integer money library and pricing engine with `MANUAL_ONLY` support
- Contribution/margin preview with risk labels (not "guaranteed profit")
- Compliance publication gate and default-blocked product categories
- Order, payment, and fulfillment state machines
- Manual payment proof workflow (eSewa/Khalti/bank) with in-memory store
- Inventory reservation with in-memory mutex for concurrent checkout tests
- WhatsApp link builder (+977 9702910130) with forbidden-content guards
- Seed catalogue: 29 screenshot-derived drafts + 3 TRIHEX-owned PUBLIC demos
- Gemini 18-month NPR 300 owner price example (DRAFT, not purchasable)
- Vitest suite: money, pricing, WhatsApp, domain/compliance/inventory tests
- Security headers via `proxy.ts`
- Health endpoint `/api/health`
- Cron route for releasing expired reservations
- Project documentation (README, architecture, ops runbooks)

### Known limitations

- **Demo/in-memory mode** when `DATABASE_URL` is unset
- Admin auth uses `ADMIN_DEV_BYPASS` stub — Supabase Auth not wired
- Orders and payments not persisted to PostgreSQL in all code paths
- DB migrations generated but **no production migrate applied**
- Analytics adapter not shipped
- Playwright E2E not included
- Many admin pages are UI shells over seed metadata

### Security

- Do not enable `ADMIN_DEV_BYPASS` in production
- Do not commit `.env.local` or payment secrets

[0.1.0]: https://github.com/trihex/trihex-digital/releases/tag/v0.1.0
