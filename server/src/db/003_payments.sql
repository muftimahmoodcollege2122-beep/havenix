-- Payment tracking on orders. Pre-existing rows are treated as already-paid demo data.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'paid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
