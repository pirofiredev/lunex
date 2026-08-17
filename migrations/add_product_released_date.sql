-- Add released column to products table
-- This enables "NEW" badge display for products released within last 30 days

ALTER TABLE products
ADD COLUMN IF NOT EXISTS released TIMESTAMPTZ;

-- Add comment explaining the column
COMMENT ON COLUMN products.released IS 'Product release date - used to display "NEW" badge for products released within last 30 days';

-- Example: Set release date for existing products (optional)
-- UPDATE products SET released = NOW() WHERE released IS NULL;
