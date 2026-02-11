-- ==============================================================================
-- LESYA COMMAND CENTER - SERVER-SIDE BUSINESS LOGIC (RPC)
-- This migration moves critical AFI chain logic from Client to Database.
-- ==============================================================================

-- 1. ADD STOCK ENTRY (Weighted Average Cost + Inventory Log + Finance)
CREATE OR REPLACE FUNCTION public.rpc_add_stock_entry(
    p_variant_id UUID,
    p_quantity INTEGER,
    p_unit_cost DECIMAL,
    p_description TEXT,
    p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_stock INTEGER;
    v_current_cost DECIMAL;
    v_total_stock_after INTEGER;
    v_weighted_average_cost DECIMAL;
    v_log_id UUID;
    v_product_name TEXT;
BEGIN
    -- A. Fetch current state
    SELECT v.stock, v.cost_price, p.name 
    INTO v_current_stock, v_current_cost, v_product_name
    FROM public.product_variants v
    JOIN public.products p ON v.product_id = p.id
    WHERE v.id = p_variant_id;

    IF v_product_name IS NULL THEN
        RAISE EXCEPTION 'Varyant bulunamadı.';
    END IF;

    -- B. Calculate Weighted Average Cost (WAC)
    v_total_stock_after := v_current_stock + p_quantity;
    
    IF v_total_stock_after > 0 THEN
        v_weighted_average_cost := ((COALESCE(v_current_stock, 0) * COALESCE(v_current_cost, 0)) + (p_quantity * p_unit_cost)) / v_total_stock_after;
    ELSE
        v_weighted_average_cost := p_unit_cost;
    END IF;

    -- C. UPDATE Variant (Stock + New WAC)
    UPDATE public.product_variants
    SET stock = v_total_stock_after,
        cost_price = v_weighted_average_cost
    WHERE id = p_variant_id;

    -- D. INSERT Inventory Log
    INSERT INTO public.inventory_logs (
        product_variant_id, type, quantity, unit_cost, total_value, description, created_by
    ) VALUES (
        p_variant_id, 'purchase', p_quantity, p_unit_cost, (p_quantity * p_unit_cost), p_description, p_admin_id
    ) RETURNING id INTO v_log_id;

    -- E. INSERT Finance Record (Expense)
    INSERT INTO public.finances (
        type, category, amount, source, related_id, description, created_by
    ) VALUES (
        'expense', 'inventory', (p_quantity * p_unit_cost), 'system_purchase', v_log_id, 
        'Stok Alımı: ' || v_product_name || ' (+' || p_quantity || ' Adet)', p_admin_id
    );

    RETURN jsonb_build_object('success', true, 'new_stock', v_total_stock_after, 'new_cost', v_weighted_average_cost);
END;
$$;


-- 2. SHIP ORDER (Update Status + Actual Cost + Finance Record)
CREATE OR REPLACE FUNCTION public.rpc_ship_order(
    p_order_id UUID,
    p_tracking_number TEXT,
    p_admin_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_standard_fee DECIMAL;
    v_order_no TEXT;
BEGIN
    -- A. Fetch Shipping Fee from Settings
    SELECT (value->>'standard_fee')::DECIMAL INTO v_standard_fee
    FROM public.store_settings WHERE key = 'shipping';
    
    IF v_standard_fee IS NULL THEN v_standard_fee := 30; END IF;

    -- B. Update Order (With Status Guard)
    UPDATE public.orders
    SET status = 'shipped',
        tracking_number = p_tracking_number,
        shipping_cost_actual = v_standard_fee,
        updated_at = now()
    WHERE id = p_order_id 
      AND status NOT IN ('shipped', 'delivered', 'cancelled') -- GUARD
    RETURNING order_number INTO v_order_no;

    IF v_order_no IS NULL THEN
        RAISE EXCEPTION 'Sipariş kargolanamadı (Zaten kargoda, iptal edilmiş veya bulunamadı).';
    END IF;

    -- C. Record Finance Expense
    INSERT INTO public.finances (
        type, category, amount, source, related_id, description, created_by
    ) VALUES (
        'expense', 'shipping', v_standard_fee, 'system_shipping', p_order_id,
        'Kargo Gönderimi: Sipariş #' || v_order_no, p_admin_id
    );
END;
$$;


-- 3. CANCEL ORDER (Update Status + Restore Stock + Finance Refund)
CREATE OR REPLACE FUNCTION public.rpc_cancel_order(
    p_order_id UUID,
    p_reason TEXT,
    p_admin_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_amount DECIMAL;
    v_order_no TEXT;
    v_item RECORD;
BEGIN
    -- A. Update Order Status (With Status Guard)
    UPDATE public.orders
    SET status = 'cancelled',
        cancelled_reason = p_reason,
        updated_at = now()
    WHERE id = p_order_id
      AND status NOT IN ('shipped', 'delivered', 'cancelled') -- GUARD
    RETURNING total_amount, order_number INTO v_total_amount, v_order_no;

    IF v_order_no IS NULL THEN
        RAISE EXCEPTION 'Sipariş iptal edilemedi (Zaten kargoda, iptal edilmiş veya bulunamadı).';
    END IF;

    -- B. Restore Stocks for each item
    FOR v_item IN SELECT product_variant_id, quantity FROM public.order_items WHERE order_id = p_order_id LOOP
        UPDATE public.product_variants
        SET stock = stock + v_item.quantity
        WHERE id = v_item.product_variant_id;
    END LOOP;

    -- C. Record Finance Refund (Expense out to return money)
    INSERT INTO public.finances (
        type, category, amount, source, related_id, description, created_by
    ) VALUES (
        'expense', 'refund', v_total_amount, 'system_return', p_order_id,
        'İade/İptal: Sipariş #' || v_order_no, p_admin_id
    );
END;
$$;


-- 4. ROLLBACK TRANSACTION (Delete Record + Reverse Stock if Inventory)
CREATE OR REPLACE FUNCTION public.rpc_rollback_transaction(
    p_transaction_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx_category public.finance_category;
    v_related_id UUID;
    v_log RECORD;
BEGIN
    -- A. Fetch Transaction Info
    SELECT category, related_id INTO v_tx_category, v_related_id
    FROM public.finances WHERE id = p_transaction_id;

    -- B. Handle Inventory Reversal
    IF v_tx_category = 'inventory' AND v_related_id IS NOT NULL THEN
        SELECT product_variant_id, quantity INTO v_log
        FROM public.inventory_logs WHERE id = v_related_id;

        IF v_log IS NOT NULL THEN
            UPDATE public.product_variants
            SET stock = GREATEST(0, stock - v_log.quantity)
            WHERE id = v_log.product_variant_id;

            DELETE FROM public.inventory_logs WHERE id = v_related_id;
        END IF;
    END IF;

    -- C. Delete Finance Record
    DELETE FROM public.finances WHERE id = p_transaction_id;
END;
$$;
