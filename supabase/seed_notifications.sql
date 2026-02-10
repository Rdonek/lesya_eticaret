-- ==========================================
-- BİLDİRİM TEST VERİLERİ (ADMIN ODAKLI)
-- ==========================================

DO $$
DECLARE
    v_admin_id UUID;
    v_order_id UUID := gen_random_uuid();
    v_product_id UUID := gen_random_uuid();
BEGIN
    -- 1. Admin kullanıcısını bul (İlk kullanıcıyı admin varsayıyoruz)
    SELECT id INTO v_admin_id FROM auth.users LIMIT 1;

    -- Eğer kullanıcı yoksa işlem yapma
    IF v_admin_id IS NULL THEN
        RAISE NOTICE 'Hiç kullanıcı bulunamadı! Lütfen önce bir kullanıcı oluşturun.';
        RETURN;
    END IF;

    RAISE NOTICE 'Bildirimler şu kullanıcıya eklenecek: %', v_admin_id;

    -- =================================================================
    -- A. KİŞİYE ÖZEL BİLDİRİMLER (SADECE ADMIN GÖRÜR)
    -- =================================================================

    -- 2. YENİ SİPARİŞ (order_new)
    -- Admin'e düşmesi gereken en kritik bildirim
    INSERT INTO public.notifications (user_id, title, body, type, related_id, data, is_read)
    VALUES (
        v_admin_id, 
        'Yeni Sipariş #10235', 
        '₺2,450.00 tutarında yeni bir sipariş onaylandı.', 
        'order_new', 
        v_order_id, 
        jsonb_build_object('action', 'open_order', 'order_number', '10235'), 
        false
    );

    -- 3. KRİTİK STOK (stock_critical)
    -- Yöneticiyi ilgilendiren stok uyarısı
    INSERT INTO public.notifications (user_id, title, body, type, related_id, data, is_read)
    VALUES (
        v_admin_id, 
        'Stok Tükeniyor', 
        'Mavi Kot Pantolon (38) stoğu kritik seviyede (1 adet).', 
        'stock_critical', 
        v_product_id, 
        jsonb_build_object('sku', 'KOT-MV-38', 'stock', 1), 
        false
    );

    -- 4. FİNANSAL UYARI (finance_low_margin)
    INSERT INTO public.notifications (user_id, title, body, type, data, is_read)
    VALUES (
        v_admin_id, 
        'Düşük Kar Marjı Uyarısı', 
        'Son satılan ürünlerde kar marjı beklenen seviyenin altında.', 
        'finance_low_margin', 
        '{}', 
        false
    );

    -- =================================================================
    -- B. GENEL BİLDİRİMLER (BROADCAST - user_id = NULL)
    -- =================================================================
    
    -- 5. SİSTEM UYARISI (Herkes görür)
    INSERT INTO public.notifications (user_id, title, body, type, data, is_read)
    VALUES (
        NULL, 
        'Sistem Güncellemesi', 
        'Yönetim paneli performans iyileştirmeleri tamamlandı.', 
        'system_alert', 
        '{}', 
        false
    );

END $$;
