-- Notification Types Enum
CREATE TYPE public.notification_type AS ENUM (
    'order_new',
    'order_status_change',
    'order_delayed',
    'return_request',
    'payment_failed',
    'stock_critical',
    'stock_out',
    'stock_low',
    'finance_loss',
    'finance_low_margin',
    'finance_daily_report',
    'crm_vip_customer',
    'crm_high_ltv',
    'marketing_campaign',
    'system_alert',
    'manual'
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- null = broadcast to all admins
    title TEXT NOT NULL CHECK (char_length(title) <= 100),
    body TEXT NOT NULL CHECK (char_length(body) <= 500),
    type public.notification_type NOT NULL DEFAULT 'manual',
    related_id UUID, -- order_id, product_id, customer_id, etc.
    data JSONB DEFAULT '{}', -- Additional context (action, url, metadata)
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for Performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications(type, created_at DESC);

-- Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications or broadcast notifications
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT 
USING (
    auth.uid() = user_id OR user_id IS NULL
);

-- Policy: Admins can create notifications
CREATE POLICY "Admins can create notifications" 
ON public.notifications FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" 
ON public.notifications FOR DELETE 
USING (auth.uid() = user_id);

-- Function: Auto-create notification on new order
CREATE OR REPLACE FUNCTION public.notify_admin_new_order()
RETURNS TRIGGER AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get first admin user (adjust query based on your user management)
    SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (
            user_id,
            title,
            body,
            type,
            related_id,
            data
        ) VALUES (
            admin_user_id,
            'Yeni Sipariş',
            'Sipariş #' || NEW.order_number || ' - ' || NEW.total_amount::text || '₺',
            'order_new',
            NEW.id,
            jsonb_build_object('action', 'open_order', 'order_number', NEW.order_number)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: New order notification
DROP TRIGGER IF EXISTS on_order_created_notify_admin ON public.orders;
CREATE TRIGGER on_order_created_notify_admin
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_order();

-- Function: Notify on order status change
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.notifications (
            user_id,
            title,
            body,
            type,
            related_id,
            data
        ) VALUES (
            NULL, -- Broadcast to admin
            'Sipariş Güncellemesi',
            'Sipariş #' || NEW.order_number || ': ' || NEW.status,
            'order_status_change',
            NEW.id,
            jsonb_build_object(
                'action', 'open_order',
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Order status change notification
DROP TRIGGER IF EXISTS on_order_status_changed ON public.orders;
CREATE TRIGGER on_order_status_changed
AFTER UPDATE ON public.orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.notify_order_status_change();

-- Function: Notify on critical stock
CREATE OR REPLACE FUNCTION public.notify_critical_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock < 3 AND (OLD.stock IS NULL OR OLD.stock >= 3) THEN
        INSERT INTO public.notifications (
            user_id,
            title,
            body,
            type,
            related_id,
            data
        ) VALUES (
            NULL,
            'Kritik Stok Uyarısı',
            'SKU: ' || NEW.sku || ' - Sadece ' || NEW.stock::text || ' adet kaldı!',
            'stock_critical',
            NEW.product_id,
            jsonb_build_object('variant_id', NEW.id, 'sku', NEW.sku, 'stock', NEW.stock)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Critical stock notification
DROP TRIGGER IF EXISTS on_stock_critical ON public.product_variants;
CREATE TRIGGER on_stock_critical
AFTER UPDATE OF stock ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.notify_critical_stock();

GRANT ALL ON TABLE public.notifications TO anon;
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;
