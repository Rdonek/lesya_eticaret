-- Create product_variants table
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  size TEXT,
  color TEXT,
  price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index on product_id
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
