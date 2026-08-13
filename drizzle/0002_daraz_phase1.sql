-- PHASE 1: fulfillment checklist + proof hash + reviews author name
-- Soft-additive only (no hard deletes).

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fulfillment_activated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fulfillment_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fulfillment_whatsapp_delivered boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fulfillment_notes text,
  ADD COLUMN IF NOT EXISTS fulfillment_delivered_at timestamptz;

ALTER TABLE manual_payment_submissions
  ADD COLUMN IF NOT EXISTS proof_content_hash text;

CREATE INDEX IF NOT EXISTS manual_payment_proof_hash_idx
  ON manual_payment_submissions (proof_content_hash)
  WHERE proof_content_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS manual_payment_sender_ref_idx
  ON manual_payment_submissions (sender_reference);

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS author_name text,
  ADD COLUMN IF NOT EXISTS category_slug text;

-- Clear fabricated compare-at / fake % off badges (honest pricing)
UPDATE product_variants
SET compare_at_price_npr_minor = NULL
WHERE compare_at_price_npr_minor IS NOT NULL;

-- Loss-price floor: Gemini 5TB AI Pro min Rs.999 (cost ~749)
UPDATE product_variants pv
SET
  manual_selling_price_npr_minor = GREATEST(
    COALESCE(pv.manual_selling_price_npr_minor, 0),
    99900
  ),
  updated_at = now()
FROM products p
WHERE pv.product_id = p.id
  AND p.slug = 'gemini-ai-pro-5tb-12m-mail-a'
  AND (
    pv.manual_selling_price_npr_minor IS NULL
    OR pv.manual_selling_price_npr_minor < 99900
  );
