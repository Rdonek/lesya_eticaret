-- 1. Temizlik
TRUNCATE products, product_variants, product_images, order_items, orders, order_logs, returns CASCADE;

-- 2. ANA ÜRÜNLER (MODELS)
INSERT INTO products (id, name, slug, description, base_price, category) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'İpek Dokulu Midi Elbise', 'ipek-dokulu-midi-elbise', 'Zarif davetler için tasarlanan, akışkan kumaşlı ve belden bağlamalı midi elbise.', 1250.00, 'Elbise'),
('550e8400-e29b-41d4-a716-446655440001', 'Kruvaze Yaka Blazer', 'kruvaze-yaka-blazer', 'Ofis şıklığını tamamlayan, modern kesimli ve vatkalı kruvaze ceket.', 1850.00, 'Ceket'),
('550e8400-e29b-41d4-a716-446655440002', 'Basic Poplin Gömlek', 'basic-poplin-gomlek', 'Mevsimsiz gardırobun olmazsa olmazı, %100 pamuklu oversize gömlek.', 650.00, 'Gömlek');

-- 3. VARYANTLAR (STOK SENARYOLARI)

-- ELBİSE (Renkler: Siyah, Kırmızı, Bej)
INSERT INTO product_variants (product_id, sku, size, color, stock) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'ELB-BLK-S', 'S', 'Siyah', 10),
('550e8400-e29b-41d4-a716-446655440000', 'ELB-BLK-M', 'M', 'Siyah', 15),
('550e8400-e29b-41d4-a716-446655440000', 'ELB-BLK-L', 'L', 'Siyah', 8),
('550e8400-e29b-41d4-a716-446655440000', 'ELB-RED-S', 'S', 'Kırmızı', 0), -- Stok Yok
('550e8400-e29b-41d4-a716-446655440000', 'ELB-RED-M', 'M', 'Kırmızı', 5),
('550e8400-e29b-41d4-a716-446655440000', 'ELB-RED-L', 'L', 'Kırmızı', 5),
('550e8400-e29b-41d4-a716-446655440000', 'ELB-BEJ-S', 'S', 'Bej', 1), -- Kritik Stok
('550e8400-e29b-41d4-a716-446655440000', 'ELB-BEJ-M', 'M', 'Bej', 2),
('550e8400-e29b-41d4-a716-446655440000', 'ELB-BEJ-L', 'L', 'Bej', 0);

-- CEKET (Renkler: Lacivert, Gri, Taba)
INSERT INTO product_variants (product_id, sku, size, color, stock) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'CEK-NAV-36', '36', 'Lacivert', 10),
('550e8400-e29b-41d4-a716-446655440001', 'CEK-NAV-38', '38', 'Lacivert', 10),
('550e8400-e29b-41d4-a716-446655440001', 'CEK-GRY-36', '36', 'Gri', 0), -- Tükendi
('550e8400-e29b-41d4-a716-446655440001', 'CEK-GRY-38', '38', 'Gri', 0), -- Tükendi
('550e8400-e29b-41d4-a716-446655440001', 'CEK-TAB-36', '36', 'Taba', 0),
('550e8400-e29b-41d4-a716-446655440001', 'CEK-TAB-38', '38', 'Taba', 5);

-- GÖMLEK (Renkler: Beyaz, Mavi Çizgili, Pembe)
INSERT INTO product_variants (product_id, sku, size, color, stock) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'GOM-WHT-S', 'S', 'Beyaz', 50),
('550e8400-e29b-41d4-a716-446655440002', 'GOM-STR-M', 'M', 'Mavi Çizgili', 20),
('550e8400-e29b-41d4-a716-446655440002', 'GOM-PNK-L', 'L', 'Pembe', 15);

-- 4. GÖRSELLER
INSERT INTO product_images (product_id, url, color, display_order) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'https://images.unsplash.com/photo-1539008835657-9e8e81839967?q=80&w=600', 'Siyah', 1),
('550e8400-e29b-41d4-a716-446655440000', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600', 'Kırmızı', 1),
('550e8400-e29b-41d4-a716-446655440000', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600', 'Bej', 1),
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600', 'Lacivert', 1),
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600', 'Gri', 1),
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600', 'Taba', 1),
('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=600', 'Beyaz', 1),
('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600', 'Mavi Çizgili', 1),
('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?q=80&w=600', 'Pembe', 1);
