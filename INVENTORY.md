# Inventory

Stock is **ledger-derived**. Available-to-sell is computed from lots and movements — not a manually edited badge.

## Core modules

| File | Role |
|------|------|
| `src/lib/inventory/ledger.ts` | Movement types, `computeAvailableToSell`, `deriveStockState` |
| `src/lib/inventory/reserve.ts` | Reserve / release (demo + test path) |
| `drizzle/functions/reserve_stock.sql` | Production PostgreSQL functions |

## Movement types

`RECEIVE` | `RESERVE` | `RELEASE` | `SELL` | `RETURN` | `WRITE_OFF` | `CORRECTION`

Each movement records `before_quantity`, `after_quantity`, `idempotency_key`, and optional `actor_id`.

## Stock states (display)

| State | Meaning |
|-------|---------|
| `IN_STOCK` | Above low-stock threshold |
| `LOW_STOCK` | At or below `lowStockThreshold` (variant default: 3) |
| `OUT_OF_STOCK` | Zero available |
| `PREORDER_DISABLED` | Zero available, preorders off |
| `PAUSED` | Admin paused sales |

## Reservations

- TTL: **30 minutes** (`RESERVATION_TTL_MINUTES` in `ledger.ts`)
- Statuses: `ACTIVE` → `CONVERTED` | `RELEASED` | `EXPIRED`
- Cron: `GET/POST /api/cron/release-reservations` (requires `CRON_SECRET`)

### Demo / test path (no DATABASE_URL)

`src/lib/inventory/reserve.ts`:

- In-memory lots and reservations (`Map`)
- **Per-variant async mutex** (`withVariantLock`) so concurrent checkouts cannot oversell in one Node process
- `seedInMemoryLot()`, `resetInMemoryInventory()` for tests
- Vitest proves only one of two simultaneous reserves succeeds when qty = 1

**Limitation:** In-memory mode is single-process only. Not suitable for production or multi-instance deploys.

### Production path (DATABASE_URL + SQL applied)

Use `reserve_stock()` in `drizzle/functions/reserve_stock.sql`:

1. `SELECT … FOR UPDATE` on FIFO lots
2. Decrement `quantity_available`, increment `quantity_reserved`
3. Insert `inventory_movements` + `stock_reservations`
4. On payment verify: `convert_reservation_to_sale()`
5. On expiry/cancel: `release_reservation()`

Application code has a TODO to call DB functions when `DATABASE_URL` is set; today it still falls through to memory unless wired.

## Admin API (stubs)

- `POST /api/admin/inventory/receive`
- `POST /api/admin/inventory/correct`

Require admin session. Full DB persistence pending.

## Rules

- Never check-then-write stock outside a transaction or lock
- Negative available is rejected (`validateMovement`)
- Idempotency keys prevent duplicate reserve/sell on retry

## Related

- [ORDER_LIFECYCLE.md](./ORDER_LIFECYCLE.md) — reservation tied to checkout
- [DATABASE.md](./DATABASE.md) — table definitions
