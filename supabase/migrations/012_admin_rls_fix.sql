-- Products Admin Access
CREATE POLICY "Admins can do everything on products" 
ON products FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Product Variants Admin Access
CREATE POLICY "Admins can do everything on product_variants" 
ON product_variants FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Product Images Admin Access
CREATE POLICY "Admins can do everything on product_images" 
ON product_images FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Allow admins to see ALL products (including inactive ones)
-- We need to drop the old public policy or modify it
DROP POLICY "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT 
USING (
  is_active = true 
  OR 
  (auth.role() = 'authenticated')
);
