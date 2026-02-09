-- Create order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  product_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index on order_id
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
