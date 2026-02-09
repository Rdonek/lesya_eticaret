-- 1. Create inventory_logs table to track weighted average cost and movements
CREATE TYPE public.inventory_log_type AS ENUM ('purchase', 'sale', 'return', 'adjustment');

CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    type public.inventory_log_type NOT NULL,
    quantity INTEGER NOT NULL, -- positive for purchase/return, negative for sale
    unit_cost DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(12,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Update finances table with source tracking
-- First, add source column if not exists (using safe approach)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'finances' AND COLUMN_NAME = 'source') THEN
        ALTER TABLE public.finances ADD COLUMN source TEXT DEFAULT 'manual';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'finances' AND COLUMN_NAME = 'related_id') THEN
        ALTER TABLE public.finances ADD COLUMN related_id UUID;
    END IF;
END $$;

-- 3. Add constraint for source types based on architecture
-- source values: 'manual', 'system_sale', 'system_purchase', 'system_shipping', 'system_return'
ALTER TABLE public.finances DROP CONSTRAINT IF EXISTS check_finance_source;
ALTER TABLE public.finances ADD CONSTRAINT check_finance_source 
CHECK (source IN ('manual', 'system_sale', 'system_purchase', 'system_shipping', 'system_return'));

-- 4. Enable RLS for inventory_logs
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage inventory logs" ON public.inventory_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Helper Function: Calculate average cost (future-proofing)
-- For now, we will use the most recent purchase cost or weighted average logic in services
