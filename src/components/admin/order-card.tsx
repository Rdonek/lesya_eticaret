'use client';

import * as React from 'react';
import Link from 'next/link';
import { Package, Truck, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import { ORDER_STATUS } from '@/lib/constants/order-status';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type OrderCardProps = {
  order: any;
  onQuickShip?: (id: string) => void;
};

export function OrderCard({ order, onQuickShip }: OrderCardProps) {
  const isPaid = order.status === ORDER_STATUS.PAID;
  
  // Get product thumbnails from order items snapshot
  const thumbnails = order.order_items?.slice(0, 3).map((item: any) => item.product_snapshot.image);

  return (
    <div className="group flex flex-col rounded-[32px] bg-white p-6 shadow-sm border border-neutral-100 transition-all hover:border-neutral-200 hover:shadow-hover">
      
      {/* Top Row: Customer & Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 transition-colors",
            isPaid ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/10" : "bg-neutral-50 text-neutral-400"
          )}>
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 text-base">{order.customer_name}</h3>
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mt-0.5">
              {order.order_number} • {new Date(order.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-neutral-900">{formatPrice(order.total_amount)}</p>
          <span className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest mt-1.5 border",
            isPaid ? "bg-green-50 text-green-700 border-green-100" :
            order.status === 'shipped' ? "bg-blue-50 text-blue-700 border-blue-100" :
            order.status === 'cancelled' ? "bg-red-50 text-red-700 border-red-100" : "bg-neutral-50 text-neutral-500 border-neutral-100"
          )}>
            {order.status === 'paid' ? 'Ödendi' : 
             order.status === 'shipped' ? 'Kargoda' : 
             order.status === 'cancelled' ? 'İptal' : 'Bekliyor'}
          </span>
        </div>
      </div>

      {/* Middle Row: Product Thumbnails */}
      {thumbnails && thumbnails.length > 0 && (
        <div className="mt-6 flex items-center gap-2">
          <div className="flex -space-x-3 overflow-hidden">
            {thumbnails.map((img: string, i: number) => (
              <div key={i} className="inline-block h-10 w-10 rounded-xl border-2 border-white bg-neutral-50 overflow-hidden shadow-sm">
                <img src={img} alt="Ürün" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-2">
            {order.order_items?.length} Ürün
          </span>
        </div>
      )}

      {/* Bottom Row: Actions */}
      <div className="mt-8 flex items-center gap-3">
        <Link href={`/admin/siparisler/${order.id}`} className="flex-1">
          <Button variant="outline" className="w-full h-11 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] border-neutral-100 hover:bg-neutral-50">
            İncele
          </Button>
        </Link>
        
        {isPaid && (
          <Button 
            onClick={() => onQuickShip?.(order.id)}
            className="flex-[1.5] h-11 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] gap-2 bg-neutral-900 text-white shadow-lg shadow-neutral-900/10 active:scale-[0.98] transition-transform"
          >
            <Truck className="h-3.5 w-3.5" />
            Kargola
          </Button>
        )}
      </div>
    </div>
  );
}