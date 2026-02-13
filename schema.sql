


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."finance_category" AS ENUM (
    'sale',
    'shipping',
    'marketing',
    'rent',
    'salary',
    'inventory',
    'refund',
    'other'
);


ALTER TYPE "public"."finance_category" OWNER TO "postgres";


CREATE TYPE "public"."finance_type" AS ENUM (
    'income',
    'expense'
);


ALTER TYPE "public"."finance_type" OWNER TO "postgres";


CREATE TYPE "public"."inventory_log_type" AS ENUM (
    'purchase',
    'sale',
    'return',
    'adjustment'
);


ALTER TYPE "public"."inventory_log_type" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
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


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."confirm_stock_deduction"("variant_id" "uuid", "qty" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE product_variants
  SET 
    stock = stock - qty,
    reserved_stock = reserved_stock - qty
  WHERE id = variant_id;
END;
$$;


ALTER FUNCTION "public"."confirm_stock_deduction"("variant_id" "uuid", "qty" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_reserved_stock"("variant_id" "uuid", "qty" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE product_variants
  SET reserved_stock = reserved_stock + qty
  WHERE id = variant_id;
END;
$$;


ALTER FUNCTION "public"."increment_reserved_stock"("variant_id" "uuid", "qty" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_admin_new_order"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."notify_admin_new_order"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_critical_stock"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."notify_critical_stock"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_order_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."notify_order_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_sale_income"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    BEGIN
         IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
             INSERT INTO public.finances (type, category, amount, description, order_id, date, source)
             VALUES (
                 'income',
                 'sale',
                NEW.total_amount,
                'Sipariş Geliri #' || NEW.order_number,
                NEW.id,
                now(),
                'system_sale' -- Kaynak artık doğru
            );
        END IF;
        RETURN NEW;
    END;
    $$;


ALTER FUNCTION "public"."record_sale_income"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_add_stock_entry"("p_variant_id" "uuid", "p_quantity" integer, "p_unit_cost" numeric, "p_description" "text", "p_admin_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."rpc_add_stock_entry"("p_variant_id" "uuid", "p_quantity" integer, "p_unit_cost" numeric, "p_description" "text", "p_admin_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_cancel_order"("p_order_id" "uuid", "p_reason" "text", "p_admin_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."rpc_cancel_order"("p_order_id" "uuid", "p_reason" "text", "p_admin_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_rollback_transaction"("p_transaction_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."rpc_rollback_transaction"("p_transaction_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rpc_ship_order"("p_order_id" "uuid", "p_tracking_number" "text", "p_admin_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."rpc_ship_order"("p_order_id" "uuid", "p_tracking_number" "text", "p_admin_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_push_notification_via_expo"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    push_tokens TEXT[];
    image_url TEXT;
    expo_response record;
    payload JSONB;
BEGIN
    -- 1. Extract image URL
    image_url := NEW.data->>'image_url';

    -- 2. Collect target admin tokens
    IF NEW.user_id IS NOT NULL THEN
        SELECT ARRAY[push_token] INTO push_tokens 
        FROM public.profiles 
        WHERE id = NEW.user_id AND push_token IS NOT NULL;
    ELSE
        SELECT array_agg(push_token) INTO push_tokens 
        FROM public.profiles 
        WHERE push_token IS NOT NULL;
    END IF;

    -- 3. Exit if no tokens found
    IF push_tokens IS NULL OR array_length(push_tokens, 1) = 0 THEN
        RETURN NEW;
    END IF;

    -- 4. Loop through tokens and send
    FOR i IN 1 .. array_length(push_tokens, 1) LOOP
        IF push_tokens[i] IS NOT NULL THEN
            
            -- Prepare the payload
            payload := jsonb_build_object(
                'to', push_tokens[i],
                'title', NEW.title,
                'body', NEW.body,
                'sound', 'default',
                'channelId', 'default', -- CRITICAL FOR ANDROID APK
                'priority', 'high',
                'mutableContent', true,
                'data', jsonb_build_object(
                    'notificationId', NEW.id,
                    'type', NEW.type,
                    'related_id', NEW.related_id
                ) || COALESCE(NEW.data, '{}'::jsonb)
            );

            -- Send and Catch Result
            SELECT status, content INTO expo_response FROM extensions.http_post(
                'https://exp.host/--/api/v2/push/send',
                payload::text,
                'application/json'
            );

            -- Log the result for debugging
            INSERT INTO public.push_logs (notification_id, token, response_status, response_body)
            VALUES (NEW.id, push_tokens[i], expo_response.status, expo_response.content);

        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."send_push_notification_via_expo"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_customer_on_order"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."sync_customer_on_order"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "full_name" "text",
    "total_spent" numeric(12,2) DEFAULT 0,
    "total_orders" integer DEFAULT 0,
    "last_order_date" timestamp with time zone,
    "segment" "text" DEFAULT 'new'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "customers_segment_check" CHECK (("segment" = ANY (ARRAY['new'::"text", 'returning'::"text", 'vip'::"text", 'lost'::"text"])))
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "public"."finance_type" NOT NULL,
    "category" "public"."finance_category" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "currency" "text" DEFAULT 'TRY'::"text",
    "description" "text",
    "date" timestamp with time zone DEFAULT "now"(),
    "order_id" "uuid",
    "attachment_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "source" "text" DEFAULT 'manual'::"text",
    "related_id" "uuid",
    CONSTRAINT "check_finance_source" CHECK (("source" = ANY (ARRAY['manual'::"text", 'system_sale'::"text", 'system_purchase'::"text", 'system_shipping'::"text", 'system_return'::"text"])))
);


ALTER TABLE "public"."finances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_variant_id" "uuid",
    "type" "public"."inventory_log_type" NOT NULL,
    "quantity" integer NOT NULL,
    "unit_cost" numeric(10,2) NOT NULL,
    "total_value" numeric(12,2) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."inventory_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "type" "public"."notification_type" DEFAULT 'manual'::"public"."notification_type" NOT NULL,
    "related_id" "uuid",
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "notifications_body_check" CHECK (("char_length"("body") <= 500)),
    CONSTRAINT "notifications_title_check" CHECK (("char_length"("title") <= 100))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "product_variant_id" "uuid",
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "product_snapshot" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "old_status" "text",
    "new_status" "text" NOT NULL,
    "note" "text",
    "created_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."order_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_number" "text" NOT NULL,
    "customer_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "address_line" "text" NOT NULL,
    "city" "text" NOT NULL,
    "postal_code" "text",
    "subtotal" numeric(10,2) NOT NULL,
    "shipping_cost" numeric(10,2) DEFAULT 0,
    "total_amount" numeric(10,2) NOT NULL,
    "status" "text" NOT NULL,
    "payment_id" "text",
    "tracking_number" "text",
    "cancelled_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "shipping_cost_actual" numeric(10,2) DEFAULT 0
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid",
    "url" "text" NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "color" "text"
);


ALTER TABLE "public"."product_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid",
    "sku" "text" NOT NULL,
    "size" "text",
    "color" "text",
    "price" numeric(10,2),
    "stock" integer DEFAULT 0,
    "reserved_stock" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "cost_price" numeric(10,2) DEFAULT 0
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "base_price" numeric(10,2),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "category_id" "uuid"
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "push_token" "text",
    "full_name" "text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."push_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "notification_id" "uuid",
    "token" "text",
    "response_status" integer,
    "response_body" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."push_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."returns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "reason" "text" NOT NULL,
    "status" "text" NOT NULL,
    "refund_amount" numeric(10,2),
    "add_stock_back" boolean DEFAULT false,
    "admin_note" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."returns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."store_settings" (
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "description" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "updated_by" "uuid"
);


ALTER TABLE "public"."store_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finances"
    ADD CONSTRAINT "finances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_logs"
    ADD CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_logs"
    ADD CONSTRAINT "order_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_payment_id_key" UNIQUE ("payment_id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_logs"
    ADD CONSTRAINT "push_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."returns"
    ADD CONSTRAINT "returns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_settings"
    ADD CONSTRAINT "store_settings_pkey" PRIMARY KEY ("key");



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type", "created_at" DESC);



CREATE INDEX "idx_notifications_unread" ON "public"."notifications" USING "btree" ("user_id", "is_read", "created_at" DESC);



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_order_items_order_id" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_order_logs_order_id" ON "public"."order_logs" USING "btree" ("order_id");



CREATE INDEX "idx_orders_email" ON "public"."orders" USING "btree" ("email");



CREATE INDEX "idx_orders_payment_id" ON "public"."orders" USING "btree" ("payment_id");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_product_images_product_id" ON "public"."product_images" USING "btree" ("product_id");



CREATE INDEX "idx_product_variants_product_id" ON "public"."product_variants" USING "btree" ("product_id");



CREATE INDEX "idx_products_slug" ON "public"."products" USING "btree" ("slug");



CREATE INDEX "idx_returns_order_id" ON "public"."returns" USING "btree" ("order_id");



CREATE OR REPLACE TRIGGER "on_notification_created_send_push" AFTER INSERT ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."send_push_notification_via_expo"();



CREATE OR REPLACE TRIGGER "on_order_created_sync_customer" AFTER INSERT ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."sync_customer_on_order"();



CREATE OR REPLACE TRIGGER "on_order_paid_record_income" AFTER UPDATE ON "public"."orders" FOR EACH ROW WHEN ((("new"."status" = 'paid'::"text") AND ("old"."status" <> 'paid'::"text"))) EXECUTE FUNCTION "public"."record_sale_income"();



CREATE OR REPLACE TRIGGER "on_order_status_changed" AFTER UPDATE ON "public"."orders" FOR EACH ROW WHEN (("old"."status" IS DISTINCT FROM "new"."status")) EXECUTE FUNCTION "public"."notify_order_status_change"();



CREATE OR REPLACE TRIGGER "on_order_status_paid_notify" AFTER UPDATE ON "public"."orders" FOR EACH ROW WHEN ((("new"."status" = 'paid'::"text") AND (("old"."status" IS NULL) OR ("old"."status" <> 'paid'::"text")))) EXECUTE FUNCTION "public"."notify_admin_new_order"();



CREATE OR REPLACE TRIGGER "on_stock_critical" AFTER UPDATE OF "stock" ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION "public"."notify_critical_stock"();



CREATE OR REPLACE TRIGGER "update_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_returns_updated_at" BEFORE UPDATE ON "public"."returns" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."finances"
    ADD CONSTRAINT "finances_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."finances"
    ADD CONSTRAINT "finances_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory_logs"
    ADD CONSTRAINT "inventory_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory_logs"
    ADD CONSTRAINT "inventory_logs_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id");



ALTER TABLE ONLY "public"."order_logs"
    ADD CONSTRAINT "order_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."returns"
    ADD CONSTRAINT "returns_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."store_settings"
    ADD CONSTRAINT "store_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Admins can create notifications" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Admins can do everything on product_images" ON "public"."product_images" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Admins can do everything on product_variants" ON "public"."product_variants" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Admins can do everything on products" ON "public"."products" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Admins can manage categories" ON "public"."categories" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Admins can manage customers" ON "public"."customers" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Admins can manage finances" ON "public"."finances" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Admins can manage inventory logs" ON "public"."inventory_logs" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Admins can manage settings" ON "public"."store_settings" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Categories are viewable by everyone" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Order items are viewable by admins" ON "public"."order_items" TO "authenticated" USING (true);



CREATE POLICY "Order logs are viewable by admins" ON "public"."order_logs" TO "authenticated" USING (true);



CREATE POLICY "Orders are viewable by admins" ON "public"."orders" TO "authenticated" USING (true);



CREATE POLICY "Product images are viewable by everyone" ON "public"."product_images" FOR SELECT USING (true);



CREATE POLICY "Product variants are viewable by everyone" ON "public"."product_variants" FOR SELECT USING (true);



CREATE POLICY "Products are viewable by everyone" ON "public"."products" FOR SELECT USING ((("is_active" = true) OR ("auth"."role"() = 'authenticated'::"text")));



CREATE POLICY "Public read access to settings" ON "public"."store_settings" FOR SELECT USING (true);



CREATE POLICY "Returns are viewable by admins" ON "public"."returns" TO "authenticated" USING (true);



CREATE POLICY "Users can delete own notifications" ON "public"."notifications" FOR DELETE TO "authenticated" USING ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "Users can manage own profile" ON "public"."profiles" TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL))) WITH CHECK ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."finances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."returns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."store_settings" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


















































































































































































































GRANT ALL ON FUNCTION "public"."confirm_stock_deduction"("variant_id" "uuid", "qty" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."confirm_stock_deduction"("variant_id" "uuid", "qty" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."confirm_stock_deduction"("variant_id" "uuid", "qty" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_reserved_stock"("variant_id" "uuid", "qty" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_reserved_stock"("variant_id" "uuid", "qty" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_reserved_stock"("variant_id" "uuid", "qty" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_admin_new_order"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_admin_new_order"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_admin_new_order"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_critical_stock"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_critical_stock"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_critical_stock"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_order_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_order_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_order_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."record_sale_income"() TO "anon";
GRANT ALL ON FUNCTION "public"."record_sale_income"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_sale_income"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rpc_add_stock_entry"("p_variant_id" "uuid", "p_quantity" integer, "p_unit_cost" numeric, "p_description" "text", "p_admin_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_add_stock_entry"("p_variant_id" "uuid", "p_quantity" integer, "p_unit_cost" numeric, "p_description" "text", "p_admin_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_add_stock_entry"("p_variant_id" "uuid", "p_quantity" integer, "p_unit_cost" numeric, "p_description" "text", "p_admin_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."rpc_cancel_order"("p_order_id" "uuid", "p_reason" "text", "p_admin_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_cancel_order"("p_order_id" "uuid", "p_reason" "text", "p_admin_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_cancel_order"("p_order_id" "uuid", "p_reason" "text", "p_admin_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."rpc_rollback_transaction"("p_transaction_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_rollback_transaction"("p_transaction_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_rollback_transaction"("p_transaction_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."rpc_ship_order"("p_order_id" "uuid", "p_tracking_number" "text", "p_admin_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."rpc_ship_order"("p_order_id" "uuid", "p_tracking_number" "text", "p_admin_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rpc_ship_order"("p_order_id" "uuid", "p_tracking_number" "text", "p_admin_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_push_notification_via_expo"() TO "anon";
GRANT ALL ON FUNCTION "public"."send_push_notification_via_expo"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_push_notification_via_expo"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_customer_on_order"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_customer_on_order"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_customer_on_order"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."finances" TO "anon";
GRANT ALL ON TABLE "public"."finances" TO "authenticated";
GRANT ALL ON TABLE "public"."finances" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_logs" TO "anon";
GRANT ALL ON TABLE "public"."inventory_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_logs" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."order_logs" TO "anon";
GRANT ALL ON TABLE "public"."order_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."order_logs" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."product_images" TO "anon";
GRANT ALL ON TABLE "public"."product_images" TO "authenticated";
GRANT ALL ON TABLE "public"."product_images" TO "service_role";



GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."push_logs" TO "anon";
GRANT ALL ON TABLE "public"."push_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."push_logs" TO "service_role";



GRANT ALL ON TABLE "public"."returns" TO "anon";
GRANT ALL ON TABLE "public"."returns" TO "authenticated";
GRANT ALL ON TABLE "public"."returns" TO "service_role";



GRANT ALL ON TABLE "public"."store_settings" TO "anon";
GRANT ALL ON TABLE "public"."store_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."store_settings" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































