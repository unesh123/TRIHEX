# RLS Policy Audit

**Status:** SQL prepared in `drizzle/rls_policies.sql` — **NOT APPLIED** (DATABASE_URL MISSING).

| Entity | RLS in SQL | Operations | Permitted | Policy names | Live test |
|--------|------------|------------|-----------|--------------|-----------|
| profiles | Enabled | SELECT/UPDATE | own / staff | profiles_select_own, profiles_update_own | BLOCKED_BY_CREDENTIALS |
| products | Enabled | SELECT | PUBLIC+APPROVED or staff | products_public_read | BLOCKED_BY_CREDENTIALS |
| product_variants | Enabled | SELECT | purchasable public or staff | variants_public_read | BLOCKED_BY_CREDENTIALS |
| product_media | Enabled | SELECT | public product or staff | media_public_read | BLOCKED_BY_CREDENTIALS |
| brands/categories | Enabled | SELECT | anon | brands_public_read, categories_public_read | BLOCKED_BY_CREDENTIALS |
| orders / order_items | Enabled | SELECT | owner or staff | orders_select_own, order_items_select_own | BLOCKED_BY_CREDENTIALS |
| payments / manual proofs | Enabled | SELECT | owner or FINANCE+ | payments_select_own, manual_payments_select | BLOCKED_BY_CREDENTIALS |
| inventory_* / reservations | Enabled | SELECT | staff roles | inventory_*_staff | BLOCKED_BY_CREDENTIALS |
| audit_logs | Enabled | SELECT | ADMIN / COMPLIANCE | audit_staff | BLOCKED_BY_CREDENTIALS |
| supplier_authorizations | Enabled | SELECT | COMPLIANCE+ | supplier_auth_staff | BLOCKED_BY_CREDENTIALS |
| business_settings | Enabled | SELECT all; write ADMIN | public read / admin write | business_settings_* | BLOCKED_BY_CREDENTIALS |

**Note:** Mutations for checkout/inventory/payment verification are intended to run via **service-role** server routes with application RBAC, not broad client JWT writes.

Apply after schema:

```bash
psql "$DATABASE_URL" -f drizzle/rls_policies.sql
```
