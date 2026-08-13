# Admin Guide

TRIHEX DIGITAL admin lives at `/admin`. This build is optimized for **local development** with seed data and in-memory backends.

## Login

### Development (recommended locally)

1. Set in `.env.local`:
   ```env
   ADMIN_DEV_BYPASS=true
   ADMIN_BOOTSTRAP_EMAIL=admin@trihex.local
   ```
2. Open `/admin/login`
3. Submit email — password optional when bypass is active
4. Session cookie `trihex_admin_session` is set (7-day max age)

**Warning:** Bypass grants `SUPER_ADMIN` role. Never enable in production.

### Production (planned)

- Supabase Auth or bcrypt-validated credentials against `profiles`
- MFA for finance and super-admin roles
- `ADMIN_DEV_BYPASS` must be `false` or unset

## Navigation overview

| Area | Path | Notes |
|------|------|-------|
| Dashboard | `/admin` | KPI shell |
| Products | `/admin/products` | CRUD shell + seed references |
| Pricing | `/admin/pricing`, product pricing tabs | Calculator + contribution |
| FX rates | `/admin/fx-rates` | NPR/USD manual rates |
| Inventory | `/admin/inventory/*` | Lots, movements, reconciliation |
| Orders | `/admin/orders` | Order list + detail |
| Payment review | `/admin/payments/review` | Manual proof queue |
| Compliance | `/admin/compliance` | Reviews and gates |
| Fulfillment | `/admin/fulfillment` | Activation queue |
| Marketing | `/admin/marketing/*` | Campaigns, coupons (demo) |
| Settings | `/admin/settings/*` | Business, WhatsApp, payments, security |
| Audit | `/admin/audit` | In-memory audit trail (demo) |

## Common workflows

### Product + pricing

1. Create/edit product — set type, fulfillment, authorization type
2. Upload compliance docs → compliance reviewer approves
3. Set variant supplier cost, pricing mode (`MANUAL_ONLY` for owner prices)
4. Run pricing calculator — check contribution labels
5. Set `PUBLIC` only when gate passes

### Stock

1. Receive inventory lot (supplier reference, qty, unit cost)
2. Monitor derived available-to-sell — not manual badges
3. Reconcile via `/admin/inventory/reconciliation`

### Payment review

1. Open `/admin/payments/review`
2. Match proof to order number and amount
3. Actions: mark under review → **verify** or **reject** with reason
4. Verify transitions payment to `PAID` — enables fulfillment

Roles: `FINANCE`, `ADMIN`, `SUPER_ADMIN` have `payments:review`.

### Payment methods / QR

Upload approved QR assets at `/admin/payment-methods` — cropped images only, stored privately when storage is wired.

## Roles (summary)

| Role | Highlights |
|------|------------|
| SUPPORT | Orders view, tickets — no payment verify |
| FULFILLMENT | Fulfill orders, inventory |
| FINANCE | Payment review, refunds, margin reports |
| COMPLIANCE_REVIEWER | Approve products, audit view |
| CATALOG_MANAGER | Edit products — cannot self-approve compliance |
| ADMIN / SUPER_ADMIN | Broad access; super-admin manages team/system |

See `src/lib/auth/permissions.ts` for full matrix.

## Demo limitations

Without `DATABASE_URL`:

- Changes may not persist across restarts
- Audit log is in-memory (last 500 events)
- Many admin pages show section metadata shells

Check `/api/health` for `database: not_connected`.

## Logout

Admin logout action clears session cookie and redirects to login.
