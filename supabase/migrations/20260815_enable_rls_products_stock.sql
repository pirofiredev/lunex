-- Enable RLS on products and stock tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Public read access to products"
ON products FOR SELECT
TO anon, authenticated
USING (true);

-- Allow public read access to stock
CREATE POLICY "Public read access to stock"
ON stock FOR SELECT
TO anon, authenticated
USING (true);
