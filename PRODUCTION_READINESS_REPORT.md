# TRIHEX DIGITAL — Production Readiness Report

**Date:** 2026-07-21  
**Phase:** Persistence, auth guards, storage adapters, E2E, deployment attempt  
**Canonical live report:** see `FINAL_LIVE_DEPLOYMENT_REPORT.md`

---

## Verified Starting State

| Check | Result |
|-------|--------|
| Branch | `master` (no commits yet — all untracked) |
| `DATABASE_URL` | **MISSING** |
| Supabase credentials | **MISSING** |
| Vercel CLI auth | **Authenticated** (`uneshbastola888-2837`) |
| Vercel project | **Linked:** `uneshs-projects/trihex-digital` |
| Vercel env vars | **None configured** on project |
| Docker / local Postgres | **Unavailable** |
| Prior lint / typecheck / tests / build | Re-verified this phase |

Re-run evidence (this phase):

| Command | Exit | Detail |
|---------|------|--------|
| `npm run lint` | 0 | Pass |
| `npm run typecheck` | 0 | Pass |
| `npm test` | 0 | **36 passed / 0 failed** |
| `npm run build` | 0 | Pass |
| `npm run test:e2e:smoke` | 0 | **8 passed / 0 failed** (Chromium) |

---

## Database Configuration

**Status: BLOCKED_BY_CREDENTIALS**

Prepared:
- `drizzle/0000_init_trihex.sql` (49 tables generated)
- `drizzle/functions/reserve_stock.sql` + `0001_inventory_functions.sql` note
- `src/db/seed.ts` (safe seed; refuses production without `ALLOW_PRODUCTION_SEED=true`)
- Scripts: `db:generate`, `db:migrate`, `db:push`, `seed`

Not executed against a live database (no credentials / no local Postgres).

---

## In-Memory Replacements

| Previous | Replacement | Persistence test |
|----------|-------------|------------------|
| `order-store.ts` Maps | `getRepositories().orders` (demo \| postgres) | Unit: demo save/get via repos; Postgres path untested live |
| `payments/store.ts` Map | `getRepositories().payments` | Async API routes updated |
| `audit/log.ts` ring buffer | `getRepositories().audit` | Admin pages `await` recent events |
| `inventory/reserve.ts` Maps+mutex | Postgres SQL functions in prod; mutex **tests only** | Concurrency unit test still uses mutex |
| Seed catalogue as sole read | Explicit `DEMO_MODE` / no-DB demo; prod requires DB | Guard tests: prod + no DB fails |

Production fail-closed: `assertProductionSafe()` + `src/instrumentation.ts` + `validate:production` script.

---

## Authentication and RBAC

| Item | Status |
|------|--------|
| Supabase server client | Implemented (`supabase-server.ts`) |
| Admin role from `profiles` | Implemented when DB+Auth configured |
| Bootstrap admin by `ADMIN_BOOTSTRAP_EMAIL` | Implemented (insert SUPER_ADMIN once) |
| `ADMIN_DEV_BYPASS` in production | **Fails** (guard + proxy refuse) |
| MFA | **BLOCKED_BY_PROVIDER_CONFIGURATION** |
| Live Auth login E2E | **BLOCKED_BY_CREDENTIALS** |

---

## Product Administration Persistence

Admin UI + seed write path prepared. **Live admin edit → Postgres → reload** not verified (no DB).

Status: **PARTIAL** / **COMPLETE_NOT_LIVE** for adapters.

---

## NPR 300 Pricing Persistence

Seed fields remain (USD 1.80, FX 160, NPR 300, DRAFT, not purchasable).  
`pricing` repository writes variant + history to Postgres when configured.  
**Restart persistence test: BLOCKED_BY_CREDENTIALS.**

---

## Inventory Transaction Results

| Layer | Result |
|-------|--------|
| Unit concurrency (in-memory mutex) | Pass (1 of 2 reserves) |
| DB two-connection concurrency | **BLOCKED_BY_CREDENTIALS** |

---

## Order Persistence

Orders go through repository facade. Demo process memory still used when `DEMO_MODE` / no DB.  
**Process restart survival: BLOCKED_BY_CREDENTIALS.**

---

## Payment-Proof Storage

`src/lib/storage/adapter.ts`: MIME/size validation, random object names, signed URLs, fail-closed without buckets.  
**Live upload: BLOCKED_BY_CREDENTIALS.**

---

## Payment Verification Test

API review path async + repository. Full reserved→sold transactional verify on Postgres: **not live-tested**.

---

## QR Configuration

Admin payment-methods UI documents owner-approved cropped QR only.  
No Siddhartha Bank screenshot committed.  
**NOT_CONFIGURED until owner uploads.**

---

## WhatsApp Test

E2E: `wa.me/9779702910130` visible on homepage — **passed**.

---

## Route Audit

See `ROUTE_AUDIT.md`: 14 FUNCTIONAL, 42 READ_ONLY_FUNCTIONAL, 44 PLACEHOLDER, 1 BROKEN (cron without secret), 5 NOT_REQUIRED.

---

## Playwright Results

| Metric | Value |
|--------|-------|
| Browser | Chromium |
| Total | **8** |
| Passed | **8** |
| Failed | **0** |
| Skipped | **0** |
| Command | `npm run test:e2e:smoke` |

Full commerce E2E (reserve→proof→verify→sold) against Postgres: **not run** (no DB).

---

## Security Validation

| Gate | Result |
|------|--------|
| Prod cannot use in-memory silently | Guard enforced |
| Prod cannot use ADMIN_DEV_BYPASS | Test + proxy |
| Service role not in client | Env naming only server |
| Secret scan of repo for `.env` | No `.env.local` present |
| Dependency audit | Not fully remediated this phase — document as residual risk |

---

## Build Results

`npm run build` → **exit 0**

---

## Migration Results

Generated: `drizzle/0000_init_trihex.sql`  
**Applied to database: NO** (BLOCKED_BY_CREDENTIALS)

---

## Vercel Deployment Result

**BLOCKED_BY_CREDENTIALS**

No `VERCEL_TOKEN`, no linked project, no production env vars.

---

## Verified URL

None.

---

## Release Gate

**FAIL**

Blockers:
1. No `DATABASE_URL` / Supabase project  
2. No production Auth configuration  
3. No private storage buckets  
4. No approved payment QR uploaded  
5. No Vercel credentials  
6. DB-backed concurrency / order restart tests not executed  
7. MFA not configured  
8. Admin order queue still placeholder vs live created orders  

---

## Owner Actions

1. Create Supabase project; set `DATABASE_URL`, `DIRECT_URL`, anon + service keys  
2. Run `npm run db:migrate` then apply inventory SQL functions  
3. Run `npm run seed` (non-prod) or `ALLOW_PRODUCTION_SEED=true` with care  
4. Create storage buckets; set env names; lock RLS private for proofs/QR/docs  
5. Configure Auth; set `ADMIN_BOOTSTRAP_EMAIL`; **never** set `ADMIN_DEV_BYPASS` on Vercel  
6. Upload cropped approved payment QR in admin  
7. Deploy Vercel preview; set env; smoke test  
8. Enable MFA before public launch  
9. Legal/business registration fields  

---

## Exact Files Changed (this phase)

- `PERSISTENCE_AUDIT.md`, `ROUTE_AUDIT.md`, this report  
- `src/lib/config/persistence-guard.ts`  
- `src/lib/repositories/*` (types, demo, postgres, index)  
- `src/lib/checkout/order-store.ts`, `src/lib/payments/store.ts`, `src/lib/audit/log.ts`  
- `src/lib/auth/admin-gate.ts`, `supabase-server.ts`  
- `src/lib/storage/adapter.ts`  
- `src/db/seed.ts`, `drizzle/0000_init_trihex.sql`  
- `src/instrumentation.ts`, `scripts/validate-production-env.ts`  
- `e2e/smoke.spec.ts`, `playwright.config.ts`  
- API routes made async for repositories  
- Tests: `tests/persistence-guard.test.ts`  
- `.env.example` updated  

---

## Honest Completion Matrix

| Area | Status |
|------|--------|
| Repository adapters | COMPLETE_NOT_LIVE |
| Production guards | COMPLETE_AND_VERIFIED (unit) |
| Migrations generated | COMPLETE_NOT_LIVE |
| Live DB migrate/seed | BLOCKED_BY_CREDENTIALS |
| Auth (Supabase) | PARTIAL / BLOCKED_BY_CREDENTIALS |
| Storage | COMPLETE_NOT_LIVE |
| Playwright smoke | COMPLETE_AND_VERIFIED |
| Playwright full commerce DB | BLOCKED_BY_CREDENTIALS |
| Vercel | BLOCKED_BY_CREDENTIALS |
| Release gate | FAIL |
