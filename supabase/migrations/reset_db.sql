-- DANGER: This script deletes ALL data from the database.
-- Use only for testing or cold start.

BEGIN;

-- Disable triggers temporarily to avoid conflicts
SET session_replication_role = 'replica';

-- Truncate tables in correct order (child -> parent)
TRUNCATE TABLE 
  returns,
  order_logs,
  order_items,
  orders,
  product_images,
  product_variants,
  products,
  categories
RESTART IDENTITY CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

COMMIT;
