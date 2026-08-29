-- Rebrand removed demo product images — image is now optional (frontend renders
-- a generated placeholder when absent), so this must not be a hard requirement
-- on order line items either.
ALTER TABLE order_items ALTER COLUMN image DROP NOT NULL;
