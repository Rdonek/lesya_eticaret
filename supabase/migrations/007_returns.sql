-- Create returns table
CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL,
  refund_amount DECIMAL(10,2),
  add_stock_back BOOLEAN DEFAULT false,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add index on order_id
CREATE INDEX idx_returns_order_id ON returns(order_id);
