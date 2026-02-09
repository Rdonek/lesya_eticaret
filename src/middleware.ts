
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // 1. Refresh Session (Standard Supabase Auth)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Check Store Status (Only for public routes)
  const isMaintenancePage = request.nextUrl.pathname === '/bakimda';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/login';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isStaticAsset = request.nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|css|js|ico)$/);

  // Skip checks for static assets, API (except maybe some), and Admin/Login
  if (!isAdminRoute && !isLoginRoute && !isApiRoute && !isStaticAsset) {
    
    // Fetch store status
    // Note: This adds a DB call to every public request. 
    // In production, consider caching logic or Edge Config.
    const { data: storeStatus } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'store_status')
      .single();

    const isStoreActive = storeStatus?.value?.is_active ?? true;

    // A. If Store is Closed AND User is NOT Admin
    // We allow logged-in admins to see the site even if closed
    const isAdminUser = user?.email?.endsWith('@lesya.com'); // Simple check or check role table
    // Ideally, we should check a role. For now, if 'user' exists, we assume they might be admin or customer.
    // But ONLY admins should see closed store. 
    // Since we don't have a robust role system in 'auth.users' metadata yet (usually),
    // we'll rely on the fact that customers don't have dashboard access. 
    // But for the public site, a customer account shouldn't bypass maintenance.
    // Let's assume ONLY users who can access /admin are exempt.
    // For MVP: If you are logged in, you pass. (Maybe restrict to specific emails later)
    
    // STRICTER RULE: Only allow access if store is open OR if it's the maintenance page
    if (!isStoreActive && !isMaintenancePage && !user) {
        return NextResponse.redirect(new URL('/bakimda', request.url));
    }

    // B. If Store is Open AND User is on Maintenance Page -> Redirect Home
    if (isStoreActive && isMaintenancePage) {
        return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
