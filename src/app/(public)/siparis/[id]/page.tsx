import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { createAdminClient } from '@/lib/supabase/admin';
import { CartClearer } from '@/components/cart/cart-clearer';

type OrderSuccessPageProps = {
  params: {
    id: string;
  };
};

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const supabase = createAdminClient();
  
  const { data: order } = await supabase
    .from('orders')
    .select('order_number')
    .eq('id', params.id)
    .single();

  if (!order) {
    return notFound();
  }

  return (
    <main className="flex min-h-[600px] flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <CartClearer />
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-bento border border-neutral-100">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-50">
          <CheckCircle className="h-10 w-10 text-neutral-900" />
        </div>
        
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">Siparişiniz Alındı!</h1>
        <p className="mb-8 text-neutral-500 font-medium">
          Teşekkür ederiz. Siparişiniz başarıyla oluşturuldu ve işleme alındı.
        </p>
        
        <div className="mb-8 rounded-xl bg-neutral-50 p-6 border border-neutral-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Sipariş Numarası</p>
          <p className="mt-2 text-2xl font-mono font-bold text-neutral-900 tracking-tight">
            {order.order_number}
          </p>
        </div>

        <Link href={ROUTES.HOME} className="w-full">
          <Button variant="primary" className="w-full h-12 rounded-xl font-bold">
            Ana Sayfaya Dön
          </Button>
        </Link>
      </div>
    </main>
  );
}