-- One review per customer per product (they can edit it, not spam duplicates).
-- No moderation queue exists yet, so reviews are auto-approved on submit —
-- is_approved stays as a real column so a moderation flow can be added later
-- without a schema change.
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE reviews ALTER COLUMN is_approved SET DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_customer_product ON reviews(customer_id, product_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id) WHERE is_approved = true;
