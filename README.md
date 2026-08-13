# TRIHEX DIGITAL

Independent digital-services retailer for Nepal. This repository is a **recovery build (v0.1.0)** — a Next.js storefront and admin control center with compliance-first catalog rules, manual payment review, and WhatsApp as a **communication channel only**.

**Status:** Local development and demo mode. **Not live in production.** Without `DATABASE_URL`, orders, payments, inventory, and audit logs run in **in-memory demo mode** (single Node process).

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Database ORM | Drizzle ORM + PostgreSQL schema |
| Auth (planned) | Supabase (`@supabase/ssr`, optional) |
| Validation | Zod |
| Tests | Vitest |
| Money | Integer minor units only (`src/lib/money`) |

## Business contact

- **WhatsApp:** [+977 9702910130](https://wa.me/9779702910130) (`9779702910130`)
- Customer support and payment **coordination** — not payment verification by itself

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (storefront) and [http://localhost:3000/admin](http://localhost:3000/admin) (admin).

### Local admin access

Set `ADMIN_DEV_BYPASS=true` in `.env.local` to access admin UI without Supabase Auth. **Never enable in production.**

## Environment

Copy `.env.example` → `.env.local`. Key variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection; omit for demo mode |
| `ADMIN_DEV_BYPASS` | Local admin UI bypass (`true` / `false`) |
| `NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER` | WhatsApp link target (default `9779702910130`) |
| `NEXT_PUBLIC_BUSINESS_WHATSAPP_DISPLAY` | Human-readable number (default `+977 9702910130`) |
| `AUTH_SECRET` | Session signing (min 32 chars when auth is wired) |
| `CRON_SECRET` | Protects `/api/cron/*` routes |

See `.env.example` for the full list.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest watch mode |
| `npm run db:generate` | Generate Drizzle migrations from schema |
| `npm run db:migrate` | Apply migrations (requires `DATABASE_URL`) |
| `npm run db:push` | Push schema to DB (dev only) |
| `npm run db:studio` | Drizzle Studio |
| `npm run seed` | Seed script (`src/db/seed.ts`) |

## Safety notes

- **Compliance gate:** Products default to `BLOCKED` or `DRAFT` until authorization is verified. See [COMPLIANCE.md](./COMPLIANCE.md).
- **No shared passwords:** TRIHEX never delivers third-party account passwords. Fulfillment uses permitted activation methods only. See [FULFILLMENT.md](./FULFILLMENT.md).
- **Payment proof ≠ paid:** Manual QR payments require admin verification on the website. WhatsApp messages do not mark orders paid. See [PAYMENTS.md](./PAYMENTS.md).
- **Website is authoritative:** Order status on the site beats chat claims. See [ORDER_LIFECYCLE.md](./ORDER_LIFECYCLE.md).
- **Demo honesty:** Catalog, checkout, and admin panels work locally with seed data. Persistence to PostgreSQL is schema-ready but not fully wired in all code paths.

## Documentation index

| Doc | Topic |
|-----|-------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System overview |
| [DATABASE.md](./DATABASE.md) | Schema and migrations |
| [PRICING_ENGINE.md](./PRICING_ENGINE.md) | NPR pricing rules |
| [INVENTORY.md](./INVENTORY.md) | Stock ledger |
| [ORDER_LIFECYCLE.md](./ORDER_LIFECYCLE.md) | Order states |
| [PAYMENTS.md](./PAYMENTS.md) | Manual QR flow |
| [WHATSAPP_OPERATIONS.md](./WHATSAPP_OPERATIONS.md) | WhatsApp ops |
| [FULFILLMENT.md](./FULFILLMENT.md) | Delivery types |
| [SECURITY.md](./SECURITY.md) | Headers, RBAC, secrets |
| [COMPLIANCE.md](./COMPLIANCE.md) | Publication gates |
| [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) | Admin workflows |
| [CUSTOMER_SUPPORT.md](./CUSTOMER_SUPPORT.md) | Support playbook |
| [MARKETING.md](./MARKETING.md) | Ads and `adReady` |
| [ANALYTICS.md](./ANALYTICS.md) | Events (planned) |
| [TESTING.md](./TESTING.md) | Vitest |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Vercel prep |
| [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) | Hostinger `.com` |
| [RUNBOOK.md](./RUNBOOK.md) | Daily operations |
| [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) | Incidents |
| [DATA_RETENTION.md](./DATA_RETENTION.md) | Retention policy |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |
| [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) | Pre-release gates |
