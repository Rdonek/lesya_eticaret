
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await financeService.rollbackTransaction(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rollback error:', error);
    return NextResponse.json({ error: 'Rollback failed' }, { status: 500 });
  }
}
