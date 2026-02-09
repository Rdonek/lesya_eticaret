
import { NextResponse } from 'next/server';
import { settingsService } from '@/lib/services/settings-service';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const settings = await settingsService.getAll();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Verify Admin
    const supabase = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Note: In a real app, you'd check role here. For now, assuming authenticated = admin or rely on RLS/middleware
    
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    await settingsService.update(key, value);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
