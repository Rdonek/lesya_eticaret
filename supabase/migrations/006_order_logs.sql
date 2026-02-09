-- Create order_logs table
CREATE TABLE order_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index on order_id
CREATE INDEX idx_order_logs_order_id ON order_logs(order_id);
