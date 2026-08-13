-- MANUAL STEP (not auto-applied by all Drizzle migrate runners):
-- After applying 0000_init_trihex.sql, run:
--   psql "$DATABASE_URL" -f drizzle/functions/reserve_stock.sql
--
-- This provides reserve_stock, convert_reservation_to_sale, and release_reservation.
SELECT 1;
