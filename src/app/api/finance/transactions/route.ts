
import { NextResponse } from 'next/server';
import { financeService } from '@/lib/services/finance-service';

export async function GET() {
  try {
    const transactions = await financeService.getTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await financeService.addTransaction(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add transaction error:', error);
    return NextResponse.json({ error: 'Failed to add transaction' }, { status: 500 });
  }
}
