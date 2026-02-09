-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Categories are viewable by everyone" 
ON categories FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON categories FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Add category_id to products
ALTER TABLE products 
ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Migrate existing text categories to new table (Optional but good for data integrity)
-- This assumes current 'category' text is clean. If not, we might skip this and let admin fix it.
-- INSERT INTO categories (name, slug)
-- SELECT DISTINCT category, lower(regexp_replace(category, '[^a-zA-Z0-9]+', '-', 'g'))
-- FROM products 
-- WHERE category IS NOT NULL
-- ON CONFLICT DO NOTHING;

-- UPDATE products p
-- SET category_id = c.id
-- FROM categories c
-- WHERE p.category = c.name;
