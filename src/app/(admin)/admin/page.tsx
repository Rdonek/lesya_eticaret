'use client';

import * as React from 'react';
import Link from 'next/link';
import { TrendingUp, Users, Tag, ShoppingBag, ArrowUpRight, ArrowRight } from 'lucide-react';
import { analyticsService, DailyRevenue, TopProduct } from '@/lib/services/analytics-service';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin/header';

export default function AdminDashboardPage() {
  const [trend, setTrend] = React.useState<DailyRevenue[]>([]);
  const [topProducts, setTopProducts] = React.useState<TopProduct[]>([]);
  const [revenueStats, setRevenueStats] = React.useState<{ total: number; percentage: number }>({ total: 0, percentage: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [trendData, productsData, statsData] = await Promise.all([
            analyticsService.getSalesTrend(30),
            analyticsService.getTopProducts(5),
            analyticsService.getRevenueStats()
        ]);
        setTrend(trendData);
        setTopProducts(productsData);
        setRevenueStats(statsData);
      } catch (e) {
        toast.error('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalRevenue = revenueStats.total;
  const totalOrders = trend.reduce((sum, day) => sum + day.orderCount, 0);

  // Bezier Curve Logic for smoother chart
  const getPath = (data: DailyRevenue[], width: number, height: number) => {
    if (data.length === 0) return '';
    if (data.length === 1) {
        // If only one data point, draw a simple horizontal line or dot
        const val = height - (data[0].revenue / (Math.max(data[0].revenue, 1))) * height * 0.8;
        return `M 0,${val} L ${width},${val}`;
    }
    
    const maxVal = Math.max(...data.map(d => d.revenue)) || 1;
    const stepX = width / (data.length - 1);
    
    const points = data.map((d, i) => ({
      x: i * stepX,
      y: height - (d.revenue / maxVal) * height * 0.8 // Keep some padding top
    }));

    return points.reduce((path, point, i, a) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      const prev = a[i - 1];
      const cx = (prev.x + point.x) / 2;
      return `${path} C ${cx},${prev.y} ${cx},${point.y} ${point.x},${point.y}`;
    }, '');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-32">
      
      <AdminHeader title="Genel Bakış" />

      {/* Primary Grid: Main Stats + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Main KPI Cards (4/12) */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-6">
            
            {/* Revenue Card - Dark Theme */}
            <div className="relative overflow-hidden rounded-[32px] bg-neutral-900 p-8 text-white shadow-xl shadow-neutral-900/20 group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <TrendingUp size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <TrendingUp size={24} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest">Aylık Ciro</p>
                        <p className="text-4xl font-black tracking-tighter mt-1">{formatPrice(totalRevenue)}</p>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                        <span className={cn(
                          "font-bold text-sm",
                          revenueStats.percentage >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {revenueStats.percentage >= 0 ? '+' : ''}{revenueStats.percentage.toFixed(1)}%
                        </span>
                        <span className="text-neutral-500 text-xs font-medium">geçen aya göre</span>
                    </div>
                </div>
            </div>

            {/* Orders Card - Light Theme */}
            <div className="relative overflow-hidden rounded-[32px] bg-white p-8 border border-neutral-100 shadow-sm group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                    <ShoppingBag size={120} />
                </div>
                <div className="relative z-10 flex items-center justify-between h-full">
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Siparişler</p>
                        <p className="text-4xl font-black tracking-tighter text-neutral-900">{totalOrders}</p>
                        <Link href="/admin/siparisler" className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 mt-2 hover:underline decoration-2">
                            Tümünü Gör <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                        <ShoppingBag size={24} className="text-neutral-900" />
                    </div>
                </div>
            </div>

        </div>

        {/* Middle: Interactive Chart (5/12) */}
        <div className="lg:col-span-5 rounded-[32px] bg-white border border-neutral-100 shadow-sm p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-neutral-900 text-lg">Satış Grafiği</h3>
                <select className="bg-neutral-50 border-none text-xs font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer">
                    <option>Son 30 Gün</option>
                    <option>Bu Hafta</option>
                </select>
            </div>
            
            <div className="flex-1 w-full min-h-[200px] relative flex items-end">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-300 uppercase tracking-widest">Yükleniyor...</div>
                ) : trend.length > 0 ? (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#171717" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#171717" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path 
                            d={`${getPath(trend, 100, 50)} L 100,50 L 0,50 Z`} 
                            fill="url(#gradient)" 
                        />
                        <path 
                            d={getPath(trend, 100, 50)} 
                            fill="none" 
                            stroke="#171717" 
                            strokeWidth="1.5" 
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-300 uppercase tracking-widest">Veri Yok</div>
                )}
            </div>
        </div>

        {/* Right: Quick Actions & Top Products (3/12) */}
        <div className="lg:col-span-3 space-y-6">
            
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/urunler/yeni" className="aspect-square rounded-[24px] bg-neutral-900 text-white flex flex-col items-center justify-center gap-2 hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20 group">
                    <Tag size={24} className="group-hover:-translate-y-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Ürün Ekle</span>
                </Link>
                <Link href="/admin/musteriler" className="aspect-square rounded-[24px] bg-white border border-neutral-100 flex flex-col items-center justify-center gap-2 hover:border-neutral-300 transition-colors shadow-sm group">
                    <Users size={24} className="text-neutral-900 group-hover:-translate-y-1 transition-transform" />
                    <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest">CRM</span>
                </Link>
            </div>

            {/* Mini Top Products List */}
            <div className="rounded-[28px] bg-neutral-50 p-6 border border-neutral-100">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Popüler</h4>
                <div className="space-y-4">
                    {topProducts.slice(0, 3).map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3 group cursor-default">
                            <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-xs font-black text-neutral-900 shadow-sm">
                                {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-neutral-900 truncate group-hover:text-neutral-600 transition-colors">{p.name}</p>
                                <p className="text-[10px] font-medium text-neutral-400">{p.totalSold} Satış</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-neutral-100">
                                <ArrowUpRight size={14} className="text-green-600" />
                            </div>
                        </div>
                    ))}
                    {topProducts.length === 0 && <p className="text-xs text-neutral-400 italic">Henüz veri yok.</p>}
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}