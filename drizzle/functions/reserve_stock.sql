-- Atomic inventory reservation function
-- Prevents overselling under concurrent checkout attempts.
-- Returns reservation_id UUID on success; raises exception on insufficient stock.

CREATE OR REPLACE FUNCTION reserve_stock(
  p_variant_id UUID,
  p_quantity INTEGER,
  p_order_id UUID DEFAULT NULL,
  p_cart_id UUID DEFAULT NULL,
  p_ttl_minutes INTEGER DEFAULT 30,
  p_actor_id UUID DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_available INTEGER;
  v_lot_id UUID;
  v_before INTEGER;
  v_reservation_id UUID;
  v_key TEXT;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'reserve_stock: quantity must be positive';
  END IF;

  v_key := COALESCE(p_idempotency_key, gen_random_uuid()::text);

  -- Idempotent replay
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_reservation_id
    FROM stock_reservations
    WHERE id::text = p_idempotency_key
       OR (order_id = p_order_id AND variant_id = p_variant_id AND status = 'ACTIVE')
    LIMIT 1;
    -- Also check movements
    IF EXISTS (SELECT 1 FROM inventory_movements WHERE idempotency_key = v_key) THEN
      SELECT id INTO v_reservation_id FROM stock_reservations
      WHERE order_id = p_order_id AND variant_id = p_variant_id AND status = 'ACTIVE'
      LIMIT 1;
      IF v_reservation_id IS NOT NULL THEN
        RETURN v_reservation_id;
      END IF;
    END IF;
  END IF;

  -- Lock lots for this variant in FIFO order
  SELECT id, quantity_available
  INTO v_lot_id, v_before
  FROM inventory_lots
  WHERE variant_id = p_variant_id
    AND status IN ('ACTIVE', 'RECEIVED')
    AND quantity_available > 0
  ORDER BY acquired_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF v_lot_id IS NULL THEN
    RAISE EXCEPTION 'reserve_stock: no available inventory for variant %', p_variant_id;
  END IF;

  -- Sum available across locked lots (simple single-lot path first; multi-lot extension below)
  SELECT COALESCE(SUM(quantity_available), 0)
  INTO v_available
  FROM inventory_lots
  WHERE variant_id = p_variant_id
    AND status IN ('ACTIVE', 'RECEIVED');

  -- Re-lock all candidate lots
  PERFORM 1 FROM inventory_lots
  WHERE variant_id = p_variant_id
    AND status IN ('ACTIVE', 'RECEIVED')
  FOR UPDATE;

  SELECT COALESCE(SUM(quantity_available), 0)
  INTO v_available
  FROM inventory_lots
  WHERE variant_id = p_variant_id
    AND status IN ('ACTIVE', 'RECEIVED');

  IF v_available < p_quantity THEN
    RAISE EXCEPTION 'reserve_stock: insufficient stock (available %, requested %)', v_available, p_quantity;
  END IF;

  -- Deduct from FIFO lots
  DECLARE
    v_remaining INTEGER := p_quantity;
    v_take INTEGER;
    r RECORD;
  BEGIN
    FOR r IN
      SELECT id, quantity_available
      FROM inventory_lots
      WHERE variant_id = p_variant_id
        AND status IN ('ACTIVE', 'RECEIVED')
        AND quantity_available > 0
      ORDER BY acquired_at ASC
      FOR UPDATE
    LOOP
      EXIT WHEN v_remaining <= 0;
      v_take := LEAST(r.quantity_available, v_remaining);

      UPDATE inventory_lots
      SET quantity_available = quantity_available - v_take,
          quantity_reserved = quantity_reserved + v_take
      WHERE id = r.id;

      INSERT INTO inventory_movements (
        id, variant_id, inventory_lot_id, type, quantity_delta,
        before_quantity, after_quantity, reason, actor_id, idempotency_key, created_at
      ) VALUES (
        gen_random_uuid(), p_variant_id, r.id, 'RESERVE', -v_take,
        r.quantity_available, r.quantity_available - v_take,
        'Checkout reservation', p_actor_id,
        v_key || ':' || r.id::text, NOW()
      );

      v_remaining := v_remaining - v_take;
    END LOOP;

    IF v_remaining > 0 THEN
      RAISE EXCEPTION 'reserve_stock: race condition — could not allocate full quantity';
    END IF;
  END;

  INSERT INTO stock_reservations (
    id, variant_id, cart_id, order_id, quantity, expires_at, status, created_at
  ) VALUES (
    gen_random_uuid(), p_variant_id, p_cart_id, p_order_id, p_quantity,
    NOW() + make_interval(mins => p_ttl_minutes), 'ACTIVE', NOW()
  )
  RETURNING id INTO v_reservation_id;

  RETURN v_reservation_id;
END;
$$;

-- Convert reservation to SELL on verified payment
CREATE OR REPLACE FUNCTION convert_reservation_to_sale(
  p_reservation_id UUID,
  p_order_item_id UUID,
  p_actor_id UUID DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  r RECORD;
  v_key TEXT;
BEGIN
  v_key := COALESCE(p_idempotency_key, 'sell:' || p_reservation_id::text);

  IF EXISTS (SELECT 1 FROM inventory_movements WHERE idempotency_key = v_key) THEN
    RETURN;
  END IF;

  SELECT * INTO r FROM stock_reservations WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'convert_reservation_to_sale: reservation not found';
  END IF;
  IF r.status != 'ACTIVE' THEN
    RAISE EXCEPTION 'convert_reservation_to_sale: reservation status is %', r.status;
  END IF;

  UPDATE inventory_lots
  SET quantity_reserved = quantity_reserved - r.quantity,
      quantity_sold = quantity_sold + r.quantity
  WHERE variant_id = r.variant_id
    AND quantity_reserved >= 0;

  -- Prefer adjusting the oldest reserved lot
  UPDATE inventory_lots il
  SET quantity_reserved = GREATEST(0, quantity_reserved - r.quantity),
      quantity_sold = quantity_sold + r.quantity
  WHERE id = (
    SELECT id FROM inventory_lots
    WHERE variant_id = r.variant_id AND quantity_reserved > 0
    ORDER BY acquired_at ASC
    LIMIT 1
  );

  INSERT INTO inventory_movements (
    id, variant_id, order_item_id, type, quantity_delta,
    before_quantity, after_quantity, reason, actor_id, idempotency_key, created_at
  ) VALUES (
    gen_random_uuid(), r.variant_id, p_order_item_id, 'SELL', -r.quantity,
    r.quantity, 0, 'Payment verified — convert reservation', p_actor_id, v_key, NOW()
  );

  UPDATE stock_reservations SET status = 'CONVERTED' WHERE id = p_reservation_id;
END;
$$;

-- Release expired or abandoned reservations
CREATE OR REPLACE FUNCTION release_reservation(
  p_reservation_id UUID,
  p_actor_id UUID DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  r RECORD;
  v_key TEXT;
BEGIN
  v_key := COALESCE(p_idempotency_key, 'release:' || p_reservation_id::text);

  IF EXISTS (SELECT 1 FROM inventory_movements WHERE idempotency_key = v_key) THEN
    RETURN;
  END IF;

  SELECT * INTO r FROM stock_reservations WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  IF r.status != 'ACTIVE' THEN
    RETURN;
  END IF;

  UPDATE inventory_lots
  SET quantity_available = quantity_available + r.quantity,
      quantity_reserved = GREATEST(0, quantity_reserved - r.quantity)
  WHERE id = (
    SELECT id FROM inventory_lots
    WHERE variant_id = r.variant_id
    ORDER BY acquired_at ASC
    LIMIT 1
  );

  INSERT INTO inventory_movements (
    id, variant_id, type, quantity_delta,
    before_quantity, after_quantity, reason, actor_id, idempotency_key, created_at
  ) VALUES (
    gen_random_uuid(), r.variant_id, 'RELEASE', r.quantity,
    0, r.quantity, 'Release reservation', p_actor_id, v_key, NOW()
  );

  UPDATE stock_reservations SET status = 'RELEASED' WHERE id = p_reservation_id;
END;
$$;
