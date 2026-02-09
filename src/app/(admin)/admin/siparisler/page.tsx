'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { OrderCard } from '@/components/admin/order-card';
import { StatusTabs, OrderStatusFilter } from '@/components/admin/status-tabs';
import { QuickShipModal } from '@/components/admin/quick-ship-modal';
import { Input } from '@/components/ui/input';
import { useToast } from '@/providers/toast-provider';
import { Search } from 'lucide-react';
import { ORDER_STATUS } from '@/lib/constants/order-status';
import { AdminHeader } from '@/components/admin/header';
import { shipOrderAction } from '@/app/actions/order';

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<OrderStatusFilter>('all');
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
  const [isShipping, setIsShipping] = React.useState(false);
  
  const { showToast } = useToast();
  const supabase = createClient();

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .neq('status', ORDER_STATUS.PENDING) 
      .order('created_at', { ascending: false });

    if (error) {
      showToast('Siparişler yüklenemedi', 'error');
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }, [supabase, showToast]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleQuickShip = async (trackingNumber: string) => {
    if (!selectedOrderId) return;
    setIsShipping(true);
    try {
      // FIX: Use the secure Server Action instead of the old service method
      const result = await shipOrderAction(selectedOrderId, trackingNumber);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Email notification (Non-blocking)
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrderId, type: 'shipped' }),
      }).catch(console.error);

      showToast('Sipariş kargolandı.');
      setSelectedOrderId(null);
      fetchOrders();
    } catch (error: any) {
      showToast('İşlem başarısız: ' + error.message, 'error');
    } finally {
      setIsShipping(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    all: orders.length,
    paid: orders.filter(o => o.status === ORDER_STATUS.PAID).length,
    shipped: orders.filter(o => o.status === ORDER_STATUS.SHIPPED).length,
    cancelled: orders.filter(o => o.status === ORDER_STATUS.CANCELLED).length,
  };

  return (
    <div className="space-y-8 pb-32">
      <AdminHeader title="Siparişler">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input 
            placeholder="Ara..." 
            className="pl-9 h-10 rounded-xl border-neutral-200 bg-white text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </AdminHeader>

      <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} counts={stats} />

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 w-full animate-pulse rounded-[28px] bg-white border border-neutral-100" />)
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onQuickShip={(id) => setSelectedOrderId(id)} />
          ))
        )}

        {filteredOrders.length === 0 && !loading && (
          <div className="py-24 text-center rounded-[40px] bg-white border border-neutral-100 shadow-sm text-neutral-400">
            Sipariş bulunamadı.
          </div>
        )}
      </div>

      <QuickShipModal isOpen={!!selectedOrderId} onClose={() => setSelectedOrderId(null)} onConfirm={handleQuickShip} isProcessing={isShipping} />
    </div>
  );
}