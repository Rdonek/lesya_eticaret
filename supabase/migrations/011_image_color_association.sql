-- Add color column to product_images to associate specific photos with specific variants
ALTER TABLE product_images ADD COLUMN color TEXT;

-- Update existing seed data to have colors (simulating for our test data)
-- Zarif Siyah Elbise (ID: a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab) is Black
UPDATE product_images SET color = 'Siyah' WHERE product_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab';

-- V-Yaka Beyaz Bluz (ID: b2c3d4e5-f6a7-4b6c-9d8e-123456789abc) is White
UPDATE product_images SET color = 'Beyaz' WHERE product_id = 'b2c3d4e5-f6a7-4b6c-9d8e-123456789abc';

-- Yüksek Bel Kot Pantolon (ID: c3d4e5f6-a7b8-4c7d-8e9f-23456789abcd) is Blue
UPDATE product_images SET color = 'Mavi' WHERE product_id = 'c3d4e5f6-a7b8-4c7d-8e9f-23456789abcd';
