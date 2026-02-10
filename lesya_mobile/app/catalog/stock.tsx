import { AdminHeader } from '@/components/shared/AdminHeader';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Body, Caption, H3 } from '@/components/ui/Typography';
import { useAllVariants, useStockActions } from '@/hooks/use-stock-actions';
import { PackagePlus, Search, X, ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatPrice } from '@/utils/format';

export default function BulkStockScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: variants, isLoading } = useAllVariants(search);
  const { addStock } = useStockActions();

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [stockQty, setStockQty] = useState('');
  const [unitCost, setUnitCost] = useState('');

  const handleAddStock = () => {
    if (!selectedVariant || !stockQty || !unitCost) return;

    const qty = Number(stockQty);
    const cost = Number(unitCost);

    if (qty <= 0 || cost < 0) {
        Alert.alert('Hata', 'Lütfen geçerli bir miktar ve maliyet girin.');
        return;
    }

    addStock.mutate({
      variantId: selectedVariant.id,
      quantity: qty,
      unitCost: cost,
      description: 'Mobil Hızlı Stok'
    }, {
      onSuccess: () => {
        setSelectedVariant(null);
        setStockQty('');
        setUnitCost('');
      }
    });
  };

  return (
    <ScreenWrapper noPadding className="bg-background">
      <View className="gap-4 px-4 pb-4 border-b border-neutral-50">
        <View className="flex-row items-center gap-4 mt-4">
            <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 rounded-full bg-neutral-50 items-center justify-center border border-neutral-100">
                <ChevronLeft size={20} color="#000" />
            </TouchableOpacity>
            <H3 className="text-base uppercase tracking-widest">HIZLI STOK GİRİŞİ</H3>
        </View>
        
        <View className="flex-row items-center bg-white border border-neutral-100 rounded-2xl px-4 h-12 shadow-sm">
            <Search size={16} color="#a3a3a3" />
            <TextInput
              placeholder="Ürün veya SKU ara..."
              className="flex-1 ml-3 text-sm font-medium h-full"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
        </View>
      </View>

      <FlatList
        data={variants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        renderItem={({ item }) => (
          <View className="mx-4 mb-3 bg-white p-5 rounded-[28px] border border-neutral-100 shadow-sm flex-row items-center justify-between">
            <View className="flex-1 mr-4">
                <H3 className="text-sm font-black text-neutral-900" numberOfLines={1}>{(item.products as any)?.name || 'Ürün'}</H3>
                <Caption className="text-neutral-400 mt-1">
                    {item.color} / {item.size} • {item.sku}
                </Caption>
                <View className="flex-row gap-3 mt-3">
                    <View className="bg-neutral-50 px-2 py-1 rounded-lg">
                        <Caption className="text-[8px] text-neutral-400">MALİYET</Caption>
                        <Body className="text-[10px] font-bold text-neutral-500">{formatPrice(item.cost_price || 0)}</Body>
                    </View>
                    <View className="bg-neutral-50 px-2 py-1 rounded-lg">
                        <Caption className="text-[8px] text-neutral-400">SATIŞ</Caption>
                        <Body className="text-[10px] font-bold text-neutral-900">{formatPrice(item.price || (item.products as any)?.base_price || 0)}</Body>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => setSelectedVariant(item)}
                activeOpacity={0.8}
                className={`h-16 w-16 rounded-2xl items-center justify-center border-2 shadow-lg shadow-black/5 ${item.stock < 5 ? 'bg-red-50 border-red-100' : 'bg-neutral-900 border-neutral-900'}`}
            >
                <Caption className={`text-[8px] font-black ${item.stock < 5 ? 'text-red-400' : 'text-white/50'}`}>STOK</Caption>
                <Body className={`font-black text-lg ${item.stock < 5 ? 'text-red-600' : 'text-white'}`}>{item.stock}</Body>
                <View className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-neutral-100">
                    <PackagePlus size={12} color="#000" />
                </View>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={!isLoading ? (
            <View className="py-20 items-center justify-center">
              <Caption className="text-neutral-300">VARYANT BULUNAMADI</Caption>
            </View>
        ) : null}
        keyboardShouldPersistTaps="handled"
      />

      {/* Stock Entry Modal */}
      <Modal visible={!!selectedVariant} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-8 pb-12 gap-6">
            <View className="flex-row justify-between items-center">
                <H3>STOK GİRİŞİ</H3>
                <TouchableOpacity onPress={() => setSelectedVariant(null)}>
                    <X size={24} color="#000" />
                </TouchableOpacity>
            </View>

            {selectedVariant && (
                <View className="bg-neutral-50 p-5 rounded-3xl border border-neutral-100">
                    <Body className="font-bold text-base">{(selectedVariant.products as any)?.name || 'Ürün'}</Body>
                    <Caption className="mt-1">{selectedVariant.color} / {selectedVariant.size}</Caption>
                    <View className="flex-row gap-4 mt-4 pt-4 border-t border-neutral-100">
                        <View>
                            <Caption>MEVCUT STOK</Caption>
                            <Body className="font-black text-lg">{selectedVariant.stock}</Body>
                        </View>
                        <View>
                            <Caption>GÜNCEL MALİYET</Caption>
                            <Body className="font-black text-lg text-neutral-400">{formatPrice(selectedVariant.cost_price || 0)}</Body>
                        </View>
                    </View>
                </View>
            )}

            <AppInput
                label="Eklenecek Miktar"
                placeholder="Örn: 10"
                keyboardType="numeric"
                value={stockQty}
                onChangeText={setStockQty}
                autoFocus
            />

            <AppInput
                label="Birim Alış Fiyatı (TL)"
                placeholder={`Örn: ${selectedVariant?.cost_price || 0}`}
                keyboardType="numeric"
                value={unitCost}
                onChangeText={setUnitCost}
            />

            <AppButton
                title={addStock.isPending ? "İŞLENİYOR..." : "STOK VE MALİYETİ GÜNCELLE"}
                onPress={handleAddStock}
                disabled={addStock.isPending || !stockQty || !unitCost}
            />
          </View>
        </View>
      </Modal>

      {isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-white/50">
            <ActivityIndicator size="large" color="#000" />
        </View>
      )}
    </ScreenWrapper>
  );
}