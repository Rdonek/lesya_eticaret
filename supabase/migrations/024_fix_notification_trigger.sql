-- UPDATE: Only notify admin when order status changes to 'paid'
-- This prevents notifications for abandoned/pending checkouts.

CREATE OR REPLACE FUNCTION public.notify_admin_new_order()
RETURNS TRIGGER AS $$
DECLARE
    admin_user_id UUID;
    image_url TEXT;
BEGIN
    -- 1. Get image of the first item for the notification thumbnail
    SELECT (product_snapshot->>'image') INTO image_url 
    FROM public.order_items 
    WHERE order_id = NEW.id 
    LIMIT 1;

    -- 2. Create the notification entry (only if status is 'paid')
    IF NEW.status = 'paid' THEN
        INSERT INTO public.notifications (
            title,
            body,
            type,
            related_id,
            data
        ) VALUES (
            'Yeni Sipariş! 🎉',
            '#' || NEW.order_number || ' - ' || NEW.total_amount::text || '₺ tutarında ödeme alındı.',
            'order_new',
            NEW.id,
            jsonb_build_object(
                'action', 'open_order', 
                'order_number', NEW.order_number,
                'image_url', image_url
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger to fire on UPDATE (status change to paid)
DROP TRIGGER IF EXISTS on_order_created_notify_admin ON public.orders;
CREATE TRIGGER on_order_status_paid_notify
AFTER UPDATE ON public.orders
FOR EACH ROW
WHEN (NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid'))
EXECUTE FUNCTION public.notify_admin_new_order();
