-- Notifications previously only tracked channel/status with no record of
-- who received it or what it said. Adding that so there's an actual audit
-- trail once real sending (Twilio WhatsApp) is wired up.
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS order_id TEXT REFERENCES orders(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS failure_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_notifications_order ON notifications(order_id);
