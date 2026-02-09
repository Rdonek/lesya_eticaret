
import { NextResponse } from 'next/server';
import { catalogService } from '@/lib/services/catalog-service';

// READ
export async function GET() {
  try {
    const data = await catalogService.getAllVariants();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
  }
}
