import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

serve(async (req) => {
  try {
    const { record, table, type } = await req.json();
    
    // Sadece bildirimler tablosuna yeni bir satÄ±r eklendiÄŸinde Ã§alÄ±ÅŸ
    if (table !== 'notifications' || type !== 'INSERT') {
        return new Response("Ignored", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Hedef KullanÄ±cÄ±larÄ±n TokenlarÄ±nÄ± Al
    let tokens: string[] = [];
    
    if (record.user_id) {
        // KiÅŸiye Ã¶zel bildirim
        const { data } = await supabase.from('profiles').select('push_token').eq('id', record.user_id).single();
        if (data?.push_token) tokens.push(data.push_token);
    } else {
        // Herkese (Adminlere) yayÄ±n
        const { data } = await supabase.from('profiles').select('push_token').not('push_token', 'is', null);
        tokens = data?.map(p => p.push_token).filter(Boolean) || [];
    }

    if (tokens.length === 0) {
        return new Response("No tokens found", { status: 200 });
    }

  // 2. Expo API Payload HazÄ±rla
  const messages = tokens.map(token => ({
    to: token,
    sound: 'default',
    title: record.title,
    body: record.body,
    data: { 
        notificationId: record.id, 
        type: record.type,
        related_id: record.related_id,
        ...record.data 
    },
    categoryIdentifier: getCategory(record.type),
    priority: 'high'
  }));

  // 3. Expo'ya GÃ¶nder
  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  const result = await response.json();
  return new Response(JSON.stringify(result), { 
    headers: { "Content-Type": "application/json" },
    status: 200 
  });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

function getCategory(type: string) {
    if (type.startsWith('order_')) return 'new_order';
    if (type.startsWith('stock_')) return 'critical_stock';
    return undefined;
}
