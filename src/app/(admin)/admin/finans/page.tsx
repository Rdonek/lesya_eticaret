'use client';

import * as React from 'react';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  MoreHorizontal,
  TrendingUp,
  Receipt,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TransactionModal } from '@/components/admin/transaction-modal';
import { useToast } from '@/providers/toast-provider';
import { AdminHeader } from '@/components/admin/header';

export default function AdminFinancePage() {
  const [stats, setStats] = React.useState<any>(null);
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { showToast } = useToast();

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, transRes] = await Promise.all([
        fetch('/api/finance/stats'),
        fetch('/api/finance/transactions')
      ]);

      if (!statsRes.ok || !transRes.ok) throw new Error('Veri yüklenemedi');

      setStats(await statsRes.json());
      setTransactions(await transRes.json());
    } catch (error) {
      showToast('Finansal veriler alınamadı', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !stats) {
    return <div className="flex h-96 items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-neutral-300" /></div>;
  }

  const isProfitPositive = stats.profit.netProfit >= 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-32">
      
      <AdminHeader title="Finansal Genel Bakış">
        <div className="flex gap-3">
            <Button variant="outline" onClick={fetchData} className="h-10 w-10 rounded-xl border-neutral-200 bg-white p-0">
                <RefreshCw className={cn("h-4 w-4 text-neutral-500", loading && "animate-spin")} />
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="h-10 rounded-xl bg-neutral-900 text-white font-semibold text-xs px-5 shadow-lg shadow-neutral-900/10 hover:shadow-xl hover:scale-[1.02] transition-all">
                <Plus className="h-3.5 w-3.5 mr-2" /> Yeni İşlem
            </Button>
        </div>
      </AdminHeader>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Net Profit (The Star) */}
        <div className="md:col-span-2 bg-neutral-900 rounded-[28px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-neutral-900/20">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <TrendingUp size={140} />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Net İşletme Kârı</p>
                        <h2 className="text-4xl font-black tracking-tighter">{formatPrice(stats.profit.netProfit)}</h2>
                    </div>
                    <div className={cn("px-3 py-1.5 rounded-lg text-xs font-bold", isProfitPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                        %{stats.profit.margin.toFixed(0)} Marj
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-8 pt-6 border-t border-white/10">
                    <div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Ciro</p>
                        <p className="font-bold text-lg">{formatPrice(stats.profit.grossRevenue)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Maliyet</p>
                        <p className="font-bold text-lg">{formatPrice(stats.profit.cogs)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Giderler</p>
                        <p className="font-bold text-lg">{formatPrice(stats.profit.operationalExpenses + stats.profit.vat)}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Card 2: Cash Balance */}
        <div className="bg-white rounded-[28px] p-8 border border-neutral-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <Wallet size={120} />
            </div>
            <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-900">
                        <Wallet size={18} />
                    </div>
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Kasa</span>
                </div>
                <div>
                    <p className="text-3xl font-black text-neutral-900 tracking-tighter">{formatPrice(stats.cash.balance)}</p>
                    <p className="text-xs text-neutral-400 font-medium mt-1">Mevcut Nakit</p>
                </div>
                <div className="space-y-2 pt-4">
                    <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">Giriş</span>
                        <span className="font-bold text-emerald-600">+{formatPrice(stats.cash.income)}</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '70%' }} />
                    </div>
                    <div className="flex justify-between text-xs mt-3">
                        <span className="text-neutral-400">Çıkış</span>
                        <span className="font-bold text-rose-600">-{formatPrice(stats.cash.expense)}</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: '40%' }} />
                    </div>
                </div>
            </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Inventory Value (1/3) - Now Neutral Theme */}
        <div className="bg-neutral-50 rounded-[28px] p-8 border border-neutral-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <Package size={100} />
            </div>
            <div className="relative z-10 space-y-4">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Depo Varlığı</p>
                <p className="text-3xl font-black tracking-tighter text-neutral-900">{formatPrice(stats.inventory.totalValue)}</p>
                <p className="text-xs font-medium text-neutral-400">{stats.inventory.totalItems} parça ürün stoğu</p>
            </div>
        </div>

        {/* Right: Transactions Feed (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-[28px] border border-neutral-100 shadow-sm flex flex-col">
            <div className="p-6 border-b border-neutral-50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">Hareket Dökümü</h3>
                <button className="text-neutral-400 hover:text-neutral-900 transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center border transition-colors shrink-0",
                                    tx.type === 'income' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                                )}>
                                    {tx.category === 'inventory' ? <Package size={16} /> : 
                                     tx.category === 'shipping' ? <Package size={16} /> :
                                     tx.category === 'sale' ? <Receipt size={16} /> : 
                                     tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-neutral-900 line-clamp-1">{tx.description}</p>
                                    <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide mt-0.5">
                                        {new Date(tx.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} • {tx.source === 'manual' ? 'Manuel' : 'Otomatik'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right pl-4">
                                <p className={cn("text-sm font-bold tabular-nums", tx.type === 'income' ? "text-emerald-600" : "text-neutral-900")}>
                                    {tx.type === 'income' ? '+' : '-'}{formatPrice(tx.amount)}
                                </p>
                            </div>
                        </div>
                    ))}
                    {transactions.length === 0 && (
                        <div className="py-12 text-center text-xs text-neutral-400 font-medium">Henüz bir işlem yok.</div>
                    )}
                </div>
            </div>
        </div>

      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData}
      />
    </div>
  );
}