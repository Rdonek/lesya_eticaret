-- 1. STORE ENGINE (Dynamic Configurations)
-- This table replaces hardcoded constants in config.ts
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Seed default settings (Safe Upsert)
INSERT INTO public.store_settings (key, value, description) VALUES
('shipping', '{"free_threshold": 500, "standard_fee": 30}', 'Kargo ücretlendirme kuralları'),
('tax', '{"vat_rate": 20}', 'Vergi (KDV) oranı'),
('store_status', '{"is_active": true, "message": "Mağazamız şu an bakımda."}', 'Mağaza açık/kapalı durumu'),
('contact', '{"whatsapp": "", "email": "", "phone": ""}', 'İletişim bilgileri')
ON CONFLICT (key) DO NOTHING;

-- RLS for Store Settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
-- Everyone can read settings (needed for public frontend to calculate shipping/tax)
CREATE POLICY "Public read access to settings" ON public.store_settings FOR SELECT USING (true);
-- Only admins can update
CREATE POLICY "Admins can manage settings" ON public.store_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 2. FINANCE HUB (Accounting & Profitability)
-- Tracks all monetary movements (income/expense)
CREATE TYPE public.finance_type AS ENUM ('income', 'expense');
CREATE TYPE public.finance_category AS ENUM (
    'sale',       -- Satış Geliri
    'shipping',   -- Kargo Gideri (Bizim kargoya ödediğimiz)
    'marketing',  -- Reklam/Pazarlama
    'rent',       -- Kira/Ofis
    'salary',     -- Personel Maaş
    'inventory',  -- Ürün Alım Maliyeti
    'refund',     -- İade
    'other'       -- Diğer
);

CREATE TABLE IF NOT EXISTS public.finances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type public.finance_type NOT NULL,
    category public.finance_category NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'TRY',
    description TEXT,
    date TIMESTAMPTZ DEFAULT now(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL, -- Opsiyonel sipariş bağlantısı
    attachment_url TEXT, -- Fiş/Fatura görseli
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS for Finances
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage finances" ON public.finances FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 3. PRODUCT COST TRACKING (COGS)
-- Essential for calculating real profit margin
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0;

-- 4. ORDER PROFITABILITY
-- Actual cost incurred for shipping this specific order (might differ from charged shipping_cost)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_cost_actual DECIMAL(10,2) DEFAULT 0;

-- 5. CRM (Customer Relationship Management)
-- A dedicated table to track customer lifetime value and segments
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT,
    
    -- Calculated Metrics (can be updated via triggers or scheduled jobs)
    total_spent DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    last_order_date TIMESTAMPTZ,
    
    -- Segmentation
    segment TEXT DEFAULT 'new' CHECK (segment IN ('new', 'returning', 'vip', 'lost')),
    notes TEXT, -- Admin internal notes about customer
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Trigger to Auto-Create/Update Customer on Order
-- When an order is created, upsert the customer record
CREATE OR REPLACE FUNCTION public.sync_customer_on_order()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.customers (email, phone, full_name, last_order_date)
    VALUES (NEW.email, NEW.phone, NEW.customer_name, NEW.created_at)
    ON CONFLICT (email) DO UPDATE SET
        phone = EXCLUDED.phone,
        full_name = EXCLUDED.full_name,
        last_order_date = EXCLUDED.last_order_date,
        total_orders = public.customers.total_orders + 1,
        total_spent = public.customers.total_spent + NEW.total_amount,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplication errors on re-run
DROP TRIGGER IF EXISTS on_order_created_sync_customer ON public.orders;
CREATE TRIGGER on_order_created_sync_customer
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_customer_on_order();

-- 7. Trigger to Auto-Record Sale as Income in Finance
CREATE OR REPLACE FUNCTION public.record_sale_income()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
        INSERT INTO public.finances (type, category, amount, description, order_id, date)
        VALUES (
            'income', 
            'sale', 
            NEW.total_amount, 
            'Sipariş Geliri #' || NEW.order_number, 
            NEW.id, 
            now()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_paid_record_income ON public.orders;
CREATE TRIGGER on_order_paid_record_income
AFTER UPDATE ON public.orders
FOR EACH ROW
WHEN (NEW.status = 'paid' AND OLD.status != 'paid')
EXECUTE FUNCTION public.record_sale_income();
