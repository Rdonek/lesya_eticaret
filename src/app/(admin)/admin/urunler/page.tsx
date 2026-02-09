'use client';

import * as React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { categoryService, Category } from '@/lib/services/category-service';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/providers/toast-provider';
import { 
  Search, 
  Plus, 
  Package, 
  Tag, 
  Archive as ArchiveIcon,
  Edit3,
  Trash2,
  RefreshCw,
  Loader2,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/header';

export default function AdminProductsPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'active' | 'archived'>('active');
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');
  
  const { showToast } = useToast();
  const supabase = createClient();

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select(`
          *,
          product_variants (id, order_items (count)),
          product_images (url)
        `).order('created_at', { ascending: false }),
        categoryService.getAll()
      ]);

      if (productsRes.error) throw productsRes.error;
      
      const processedProducts = productsRes.data?.map(p => {
        const hasOrders = p.product_variants?.some((v: any) => v.order_items?.[0]?.count > 0);
        return { ...p, hasOrders };
      });

      setProducts(processedProducts || []);
      setCategories(categoriesRes || []);
    } catch (error) {
      showToast('Veriler yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [supabase, showToast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await categoryService.create({ name: newCatName.trim() });
      showToast('Kategori eklendi');
      setNewCatName('');
      setIsAddingCategory(false);
      fetchData();
    } catch (error) {
      showToast('Hata oluştu', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    try {
      await categoryService.delete(id);
      showToast('Kategori silindi');
      if (selectedCategoryId === id) setSelectedCategoryId(null);
      fetchData();
    } catch (error) {
      showToast('Kategori silinemedi (Ürünler bağlı olabilir)', 'error');
    }
  };

  const handleArchive = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    setActionLoading(product.id);
    try {
      const { error } = await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
      if (error) throw error;
      showToast(product.is_active ? 'Ürün arşivlendi' : 'Ürün yayına alındı');
      fetchData();
    } catch (error) {
      showToast('İşlem başarısız', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (e: React.MouseEvent, product: any) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Ürün kalıcı olarak silinecek?')) return;
    setActionLoading(product.id);
    try {
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (error) throw error;
      showToast('Ürün silindi');
      fetchData();
    } catch (error) {
      showToast('Silme başarısız', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'active' ? product.is_active : !product.is_active;
    const matchesCategory = !selectedCategoryId || product.category_id === selectedCategoryId;
    return matchesSearch && matchesTab && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-32">
      
      <AdminHeader title="Katalog">
        <Link href="/admin/katalog/stok">
            <Button variant="outline" className="h-10 rounded-xl border-neutral-200 text-xs font-bold gap-2 px-4">
              <TrendingUp className="h-3.5 w-3.5" /> Hızlı Stok
            </Button>
        </Link>
        <Link href="/admin/urunler/yeni">
            <Button className="h-10 rounded-xl bg-neutral-900 text-white text-xs font-bold shadow-lg shadow-neutral-900/10 px-5 gap-2">
              <Plus className="h-3.5 w-3.5" /> Yeni Ürün
            </Button>
        </Link>
      </AdminHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Categories Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="rounded-[28px] bg-white border border-neutral-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Kategoriler</h3>
              <button onClick={() => setIsAddingCategory(!isAddingCategory)} className="h-6 w-6 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all">
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {isAddingCategory && (
              <form onSubmit={handleCreateCategory} className="animate-in fade-in slide-in-from-top-2">
                <Input placeholder="Yeni kategori..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="h-10 rounded-xl bg-neutral-50 border-neutral-100 text-xs" autoFocus />
              </form>
            )}

            <nav className="space-y-1">
              <button onClick={() => setSelectedCategoryId(null)} className={cn("w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all", !selectedCategoryId ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/10" : "text-neutral-500 hover:bg-neutral-50")}>
                Tümü
                <ChevronRight className={cn("h-3 w-3 opacity-0", !selectedCategoryId && "opacity-100 translate-x-1")} />
              </button>
              {categories.map((cat) => (
                <div key={cat.id} className="group relative">
                  <button onClick={() => setSelectedCategoryId(cat.id)} className={cn("w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all", selectedCategoryId === cat.id ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/10" : "text-neutral-500 hover:bg-neutral-50")}>
                    {cat.name}
                    <ChevronRight className={cn("h-3 w-3 opacity-0", selectedCategoryId === cat.id && "opacity-100 translate-x-1")} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex p-1.5 bg-neutral-100 rounded-2xl gap-1">
            <button onClick={() => setActiveTab('active')} className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", activeTab === 'active' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400 hover:text-neutral-600")}>Satışta</button>
            <button onClick={() => setActiveTab('archived')} className={cn("flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", activeTab === 'archived' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400 hover:text-neutral-600")}>Arşiv</button>
          </div>
        </aside>

        {/* Right Column: Products List */}
        <main className="lg:col-span-9 space-y-6">
          <div className="relative group w-full">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
            <Input placeholder="Ürünlerde ara..." className="pl-11 h-12 rounded-2xl border-neutral-100 bg-white shadow-sm focus:ring-4 focus:ring-neutral-900/5 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 w-full animate-pulse rounded-[28px] bg-white border border-neutral-100" />)
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-[28px] bg-white border border-neutral-100 transition-all hover:shadow-hover hover:border-neutral-200 gap-4">
                  <Link href={`/admin/urunler/${product.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-2xl bg-neutral-50 overflow-hidden border border-neutral-100 shadow-inner">
                      {product.product_images?.[0]?.url ? (
                        <img src={product.product_images[0].url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-500" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-neutral-300"><Package className="h-6 w-6" /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-neutral-900 truncate pr-2 text-base">{product.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-xs font-medium text-neutral-400 mt-1">
                        <span className="text-neutral-900 font-bold">{formatPrice(product.base_price)}</span>
                        <span className="h-1 w-1 rounded-full bg-neutral-200 hidden md:block" />
                        <span className="uppercase tracking-widest">{categories.find(c => c.id === product.category_id)?.name || 'Genel'}</span>
                        <span className={cn("px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter", product.is_active ? "text-green-600 bg-green-50" : "text-neutral-400 bg-neutral-50")}>
                          {product.is_active ? 'Satışta' : 'Arşivde'}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center justify-end gap-2 border-t border-neutral-50 pt-3 md:border-none md:pt-0">
                    {actionLoading === product.id ? (
                      <div className="h-10 w-10 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-neutral-400" /></div>
                    ) : (
                      <>
                        <button onClick={(e) => handleArchive(e, product)} className={cn("flex-1 md:flex-none h-10 px-4 md:px-0 md:w-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm", product.is_active ? "bg-neutral-50 text-neutral-400 hover:bg-neutral-900 hover:text-white" : "bg-neutral-900 text-white")}>
                          {product.is_active ? <ArchiveIcon className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                          <span className="md:hidden text-[10px] font-bold uppercase">{product.is_active ? 'Arşivle' : 'Yayına Al'}</span>
                        </button>
                        {!product.hasOrders && (
                          <button onClick={(e) => handleDeleteProduct(e, product)} className="flex-1 md:flex-none h-10 px-4 md:px-0 md:w-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 className="h-4 w-4" /><span className="md:hidden text-[10px] font-bold uppercase">Sil</span></button>
                        )}
                        <Link href={`/admin/urunler/${product.id}`} className="flex-1 md:flex-none h-10 px-4 md:px-0 md:w-10 rounded-xl bg-neutral-50 text-neutral-400 flex items-center justify-center gap-2 hover:bg-neutral-900 hover:text-white transition-all shadow-sm"><Edit3 className="h-4 w-4" /><span className="md:hidden text-[10px] font-bold uppercase">Düzenle</span></Link>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}