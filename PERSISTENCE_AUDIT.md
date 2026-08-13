# TRIHEX DIGITAL — Persistence Audit

**Audited:** 2026-07-21  
**Environment:** No `DATABASE_URL`, no `.env.local`, Docker daemon unavailable, no Vercel token.

## Summary

All commerce state that survives only in process memory is a **production risk**. Replacement is PostgreSQL via Drizzle repositories. Demo adapters remain only when `DEMO_MODE=true` and `NODE_ENV!==production`.

## Discovered in-memory / demo stores

| File | Entity | Purpose | Dev use | Production risk | Replacement | Status |
|------|--------|---------|---------|-----------------|-------------|--------|
| `src/lib/checkout/order-store.ts` | orders | Map by id/number/token | Demo checkout/track | Orders lost on restart; multi-instance inconsistent | `src/lib/repositories/orders.ts` (Postgres) | REPLACING |
| `src/lib/payments/store.ts` | manual payments | Map of proof submissions | Demo payment review | Lost proofs/verification; double-sell risk across instances | `src/lib/repositories/payments.ts` | REPLACING |
| `src/lib/audit/log.ts` | audit events | Ring buffer array (500) | Local audit trail | No durable compliance trail | `audit_logs` table via repository | REPLACING |
| `src/lib/inventory/reserve.ts` | lots + reservations | Maps + per-variant mutex | Unit concurrency tests | Mutex is single-process only; oversell across instances | PostgreSQL `reserve_stock` + Drizzle tx | REPLACING (mutex kept for unit tests only) |
| `src/db/seed-data.ts` | catalogue | Hard-coded seed records | Demo catalogue when no DB | OK as seed source; must not be sole production read path | Seed → PostgreSQL; storefront reads DB | PARTIAL |
| `src/lib/catalog/demo-catalog.ts` | storefront products | Maps seed → cards | Offline UI | Silent demo catalogue in prod | Guard: DEMO_MODE only | HARDENING |
| `src/lib/auth/admin-gate.ts` | admin session | Cookie stub + ADMIN_DEV_BYPASS | Local admin UI | Full SUPER_ADMIN without real auth | Supabase Auth session + roles in `profiles` | HARDENING |
| Cart `localStorage` (`trihex_cart`) | cart lines | Browser cart | Guest UX | Acceptable for guest cart; must revalidate server-side | Keep client cart; server revalidate on checkout | OK (with server revalidation) |
| `src/components/*/new Map(catalog…)` | UI lookup | Transient Map | Rendering | None | N/A | OK |

## Process-local concurrency

| Mechanism | File | Production allowed? |
|-----------|------|---------------------|
| `variantLocks` Promise mutex | `reserve.ts` | **NO** — tests only |
| PostgreSQL `FOR UPDATE` / `reserve_stock()` | `drizzle/functions/reserve_stock.sql` | **YES** |

## Migrations

| Item | Status |
|------|--------|
| `src/db/schema.ts` | Present |
| `drizzle/functions/reserve_stock.sql` | Present |
| Generated Drizzle SQL migrations | **Missing** at audit time — generating this phase |
| Applied to live DB | **BLOCKED_BY_CREDENTIALS** |

## Credentials check

| Variable | Present |
|----------|---------|
| DATABASE_URL | No |
| DIRECT_URL | No |
| NEXT_PUBLIC_SUPABASE_URL | No |
| SUPABASE_SERVICE_ROLE_KEY | No |
| VERCEL_TOKEN | No |
| ADMIN_DEV_BYPASS | Not set (default off) |

## Policy going forward

1. `assertPersistenceAllowed()` fails production startup if `DATABASE_URL` missing, `DEMO_MODE=true`, or `ADMIN_DEV_BYPASS=true`.
2. Repositories selected explicitly: `postgres` | `demo` | `test`.
3. Production never auto-selects demo.
4. In-memory Maps remain only behind `createDemo*` factories used by tests/demo mode.
