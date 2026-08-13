# Database

## Overview

PostgreSQL schema is defined in **`src/db/schema.ts`** using Drizzle ORM. The client is created in `src/db/index.ts` only when `DATABASE_URL` is set.

**Current state:** Schema and SQL functions exist. **No production migration has been applied.** The app runs in **demo/in-memory mode** when `DATABASE_URL` is missing.

## Schema domains

| Domain | Tables (representative) |
|--------|-------------------------|
| Identity | `profiles`, `customers`, `customer_addresses` |
| Business | `business_settings`, `site_settings`, `feature_flags` |
| Catalog | `brands`, `categories`, `collections`, `products`, `product_variants`, `product_media`, `tags` |
| Compliance | Fields on `products`; `supplier_authorizations` |
| Suppliers | `suppliers`, `supplier_products`, `supplier_cost_history` |
| Inventory | `inventory_lots`, `inventory_movements`, `stock_reservations` |
| Commerce | `carts`, `cart_items`, `orders`, `order_items`, `order_status_history` |
| Payments | `payments`, `manual_payment_submissions` |
| Fulfillment | `fulfillments`, `redeem_codes`, `secure_delivery_messages` |
| Post-sale | `warranty_cases`, `refunds`, `support_tickets`, `reviews` |
| Finance | `fx_rates`, `pricing_rules`, `coupons`, `promotions` |
| Ops | `audit_logs`, `webhook_events`, `job_queue`, `notifications` |

Enums cover roles, order/payment/fulfillment statuses, product types, fulfillment types, pricing modes, and movement types.

## Key constraints

- **`products_public_requires_approved`:** `product_status = PUBLIC` requires `compliance_status = APPROVED` (DB check).
- **`variants_purchasable_requires_price`:** Purchasable variants must have computed or manual selling price.
- Inventory lots: non-negative `quantity_available`, `quantity_reserved`, `quantity_sold`.
- Idempotency keys on `inventory_movements` and `payments`.

## Inventory SQL functions

File: **`drizzle/functions/reserve_stock.sql`**

| Function | Purpose |
|----------|---------|
| `reserve_stock(...)` | FIFO lot lock, reserve qty, insert movement + reservation |
| `convert_reservation_to_sale(...)` | On verified payment: reserved → sold |
| `release_reservation(...)` | Return stock on expiry/cancel |

These must be applied to PostgreSQL **after** base tables exist. They are not auto-run by the app today.

## Migrations

| Command | Use |
|---------|-----|
| `npm run db:generate` | Generate migration SQL from schema → `./drizzle/` |
| `npm run db:migrate` | Apply migrations (requires `DATABASE_URL`) |
| `npm run db:push` | Dev-only schema push |
| `npm run seed` | Run `src/db/seed.ts` (when implemented against DB) |

**Forward migrations needed:**

1. Generate initial migration from `src/db/schema.ts`
2. Apply `drizzle/functions/reserve_stock.sql` as a follow-up migration or manual step
3. Seed catalogue via `seed-data.ts` / `seed.ts` after compliance review

**Do not run `db:migrate` against production** until credentials, backups, and release checklist are complete. See [DEPLOYMENT.md](./DEPLOYMENT.md).

## Demo mode behavior

When `DATABASE_URL` is absent:

| Feature | Backing store |
|---------|---------------|
| Orders | `src/lib/checkout/order-store.ts` (Map) |
| Manual payments | `src/lib/payments/store.ts` (Map) |
| Inventory reservations | `src/lib/inventory/reserve.ts` (in-memory lots) |
| Audit log | `src/lib/audit/log.ts` (ring buffer, max 500) |
| Catalog | `src/db/seed-data.ts` via demo catalog |

Data is lost on process restart.

## Connection

```env
DATABASE_URL=postgresql://user:pass@host:5432/trihex_digital
DIRECT_URL=postgresql://...   # optional, for Drizzle migrations
```

Optional Supabase: `NEXT_PUBLIC_SUPABASE_URL`, keys in `.env.example`.

## Related docs

- [INVENTORY.md](./INVENTORY.md) — ledger and reservations
- [ARCHITECTURE.md](./ARCHITECTURE.md) — application layers
