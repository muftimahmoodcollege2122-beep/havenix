CREATE TABLE IF NOT EXISTS admin_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data BYTEA NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
