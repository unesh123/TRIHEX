-- TRIHEX DIGITAL — Row Level Security policies
-- Apply AFTER schema migration and AFTER seeding admin bootstrap.
-- Run: psql "$DATABASE_URL" -f drizzle/rls_policies.sql
--
-- Model:
-- - anon: read public catalogue only
-- - authenticated customer: own profile/orders only
-- - staff roles enforced primarily via service-role server routes;
--   RLS still denies broad client access to finance/inventory tables.

BEGIN;

-- Enable RLS on sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_cases ENABLE ROW LEVEL SECURITY;

-- Helper: current auth user id from JWT
CREATE OR REPLACE FUNCTION trihex_auth_uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(auth.uid()::text, '')::uuid
$$;

CREATE OR REPLACE FUNCTION trihex_is_staff() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.auth_user_id = auth.uid()
      AND p.role IN (
        'SUPPORT','FULFILLMENT','CATALOG_MANAGER','FINANCE',
        'COMPLIANCE_REVIEWER','ADMIN','SUPER_ADMIN'
      )
      AND p.account_status = 'ACTIVE'
  );
$$;

CREATE OR REPLACE FUNCTION trihex_has_role(roles text[]) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.auth_user_id = auth.uid()
      AND p.role::text = ANY(roles)
      AND p.account_status = 'ACTIVE'
  );
$$;

-- Profiles: own row read/update; staff read
DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (
    auth_user_id = auth.uid() OR trihex_is_staff()
  );

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid() AND role = (SELECT role FROM profiles WHERE auth_user_id = auth.uid()));

-- Catalogue: public read of PUBLIC products only
DROP POLICY IF EXISTS products_public_read ON products;
CREATE POLICY products_public_read ON products
  FOR SELECT USING (
    product_status = 'PUBLIC'
    AND compliance_status = 'APPROVED'
    OR trihex_is_staff()
  );

DROP POLICY IF EXISTS variants_public_read ON product_variants;
CREATE POLICY variants_public_read ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id
        AND p.product_status = 'PUBLIC'
        AND p.compliance_status = 'APPROVED'
        AND product_variants.active = true
        AND product_variants.purchasable = true
    )
    OR trihex_is_staff()
  );

DROP POLICY IF EXISTS media_public_read ON product_media;
CREATE POLICY media_public_read ON product_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id AND p.product_status = 'PUBLIC'
    )
    OR trihex_is_staff()
  );

DROP POLICY IF EXISTS brands_public_read ON brands;
CREATE POLICY brands_public_read ON brands FOR SELECT USING (true);

DROP POLICY IF EXISTS categories_public_read ON categories;
CREATE POLICY categories_public_read ON categories FOR SELECT USING (true);

-- Orders: customer owns by profile link or email match via secure server paths;
-- client JWT users only see own customerId rows
DROP POLICY IF EXISTS orders_select_own ON orders;
CREATE POLICY orders_select_own ON orders
  FOR SELECT USING (
    customer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR trihex_has_role(ARRAY['SUPPORT','FULFILLMENT','FINANCE','ADMIN','SUPER_ADMIN'])
  );

DROP POLICY IF EXISTS order_items_select_own ON order_items;
CREATE POLICY order_items_select_own ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.customer_id
      WHERE o.id = order_id AND p.auth_user_id = auth.uid()
    )
    OR trihex_is_staff()
  );

-- Payments / proofs: own or finance
DROP POLICY IF EXISTS payments_select_own ON payments;
CREATE POLICY payments_select_own ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.customer_id
      WHERE o.id = order_id AND p.auth_user_id = auth.uid()
    )
    OR trihex_has_role(ARRAY['FINANCE','ADMIN','SUPER_ADMIN'])
  );

DROP POLICY IF EXISTS manual_payments_select ON manual_payment_submissions;
CREATE POLICY manual_payments_select ON manual_payment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.customer_id
      WHERE o.id = order_id AND p.auth_user_id = auth.uid()
    )
    OR trihex_has_role(ARRAY['FINANCE','ADMIN','SUPER_ADMIN'])
  );

-- Inventory / audit / supplier docs: staff only (mutations via service role)
DROP POLICY IF EXISTS inventory_lots_staff ON inventory_lots;
CREATE POLICY inventory_lots_staff ON inventory_lots
  FOR SELECT USING (trihex_has_role(ARRAY['FULFILLMENT','CATALOG_MANAGER','FINANCE','ADMIN','SUPER_ADMIN']));

DROP POLICY IF EXISTS inventory_movements_staff ON inventory_movements;
CREATE POLICY inventory_movements_staff ON inventory_movements
  FOR SELECT USING (trihex_has_role(ARRAY['FULFILLMENT','CATALOG_MANAGER','FINANCE','ADMIN','SUPER_ADMIN']));

DROP POLICY IF EXISTS reservations_staff ON stock_reservations;
CREATE POLICY reservations_staff ON stock_reservations
  FOR SELECT USING (trihex_has_role(ARRAY['FULFILLMENT','FINANCE','ADMIN','SUPER_ADMIN']));

DROP POLICY IF EXISTS audit_staff ON audit_logs;
CREATE POLICY audit_staff ON audit_logs
  FOR SELECT USING (trihex_has_role(ARRAY['ADMIN','SUPER_ADMIN','COMPLIANCE_REVIEWER']));

DROP POLICY IF EXISTS supplier_auth_staff ON supplier_authorizations;
CREATE POLICY supplier_auth_staff ON supplier_authorizations
  FOR SELECT USING (trihex_has_role(ARRAY['COMPLIANCE_REVIEWER','ADMIN','SUPER_ADMIN']));

-- Business settings: public read of non-secret fields via server; deny client writes
DROP POLICY IF EXISTS business_settings_read ON business_settings;
CREATE POLICY business_settings_read ON business_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS business_settings_write ON business_settings;
CREATE POLICY business_settings_write ON business_settings
  FOR ALL USING (trihex_has_role(ARRAY['ADMIN','SUPER_ADMIN']))
  WITH CHECK (trihex_has_role(ARRAY['ADMIN','SUPER_ADMIN']));

COMMIT;
