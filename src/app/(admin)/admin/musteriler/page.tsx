'use client';

import * as React from 'react';
import { customerService, Customer } from '@/lib/services/customer-service';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, User, Star, Flame, Ghost } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { AdminHeader } from '@/components/admin/header';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error('Müşteri listesi yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCustomers = customers.filter(c => 
    (c.full_name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const SegmentBadge = ({ segment }: { segment: string }) => {
    const config: any = {
      vip: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Star, label: "VIP" },
      returning: { color: "bg-green-100 text-green-700 border-green-200", icon: Flame, label: "Sadık" },
      new: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: User, label: "Yeni" },
      lost: { color: "bg-neutral-100 text-neutral-500 border-neutral-200", icon: Ghost, label: "Kayıp" }
    };
    const s = config[segment] || config.new;
    const Icon = s.icon;
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", s.color)}>
        <Icon size={10} />
        {s.label}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-32">
      
      <AdminHeader title="Müşteriler">
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input 
                placeholder="İsim veya e-posta..." 
                className="pl-9 h-10 rounded-xl border-neutral-200 bg-white text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="h-10 w-10 p-0 rounded-xl border-neutral-200">
             <RefreshCw className={cn("h-4 w-4 text-neutral-500", loading && "animate-spin")} />
        </Button>
      </AdminHeader>

       {/* List */}
       <div className="rounded-[28px] bg-white border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-neutral-50/50 border-b border-neutral-100">
                        <th className="px-8 py-5 font-bold text-neutral-900">Müşteri</th>
                        <th className="px-8 py-5 font-bold text-neutral-900">Segment</th>
                        <th className="px-8 py-5 font-bold text-neutral-900">Sipariş</th>
                        <th className="px-8 py-5 font-bold text-neutral-900">Harcanan</th>
                        <th className="px-8 py-5 font-bold text-neutral-900 text-right">Son Alışveriş</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan={5} className="px-8 py-6 h-20 bg-white" />
                            </tr>
                        ))
                    ) : filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="group hover:bg-neutral-50 transition-colors">
                            <td className="px-8 py-5">
                                <div>
                                    <p className="font-bold text-neutral-900 text-sm">{customer.full_name || 'İsimsiz'}</p>
                                    <p className="text-[10px] text-neutral-400 font-medium">{customer.email}</p>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <SegmentBadge segment={customer.segment} />
                            </td>
                            <td className="px-8 py-5">
                                <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-1 rounded-lg text-[10px]">
                                    {customer.total_orders}
                                </span>
                            </td>
                            <td className="px-8 py-5">
                                <span className="font-bold text-neutral-900 text-sm tabular-nums">
                                    {formatPrice(customer.total_spent)}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-right text-neutral-500 font-medium text-xs">
                                {customer.last_order_date 
                                    ? new Date(customer.last_order_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                                    : '-'
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}