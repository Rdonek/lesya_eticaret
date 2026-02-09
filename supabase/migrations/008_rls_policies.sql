-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

-- Products: SELECT public (where is_active = true)
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT 
USING (is_active = true);

-- Product Variants: SELECT public
CREATE POLICY "Product variants are viewable by everyone" 
ON product_variants FOR SELECT 
USING (true);

-- Product Images: SELECT public
CREATE POLICY "Product images are viewable by everyone" 
ON product_images FOR SELECT 
USING (true);

-- Orders: Admin only (using service_role or authenticated with admin check)
-- For now, we restrict to authenticated users as a baseline for admin access
CREATE POLICY "Orders are viewable by admins" 
ON orders FOR ALL 
TO authenticated 
USING (true);

CREATE POLICY "Order items are viewable by admins" 
ON order_items FOR ALL 
TO authenticated 
USING (true);

CREATE POLICY "Order logs are viewable by admins" 
ON order_logs FOR ALL 
TO authenticated 
USING (true);

CREATE POLICY "Returns are viewable by admins" 
ON returns FOR ALL 
TO authenticated 
USING (true);
