import { NextRequest, NextResponse } from 'next/server';
import { financeService } from '@/lib/services/finance-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!) 
      : new Date(new Date().setDate(new Date().getDate() - 30));
      
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')!) 
      : new Date();

    const [profitStats, cashFlow, inventory] = await Promise.all([
      financeService.getStats(startDate, endDate),
      financeService.getCashFlow(startDate, endDate),
      financeService.getInventoryValue()
    ]);

    return NextResponse.json({
      profit: profitStats,
      cash: cashFlow,
      inventory: inventory
    });
  } catch (error) {
    console.error('Finance stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}