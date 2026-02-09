
import { NextResponse } from 'next/server';
import { catalogService } from '@/lib/services/catalog-service';

// UPDATE (Batch)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    if (!Array.isArray(body) || body.length === 0) {
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    await catalogService.batchUpdateVariants(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update catalog' }, { status: 500 });
  }
}
