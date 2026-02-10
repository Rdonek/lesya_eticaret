import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, Text, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { H3, Body, Caption } from '@/components/ui/Typography';
import { useCatalogActions, useCategories } from '@/hooks/use-catalog';
import { useStockActions } from '@/hooks/use-stock-actions';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import {
  ChevronLeft,
  Trash2,
  Archive,
  Tag,
  Package,
  PackagePlus,
  X,
  Plus,
  Camera,
  Image as ImageIcon
} from 'lucide-react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { formatPrice } from '@/utils/format';

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const { toggleStatus } = useCatalogActions();
  const { addStock } = useStockActions();
  const { data: categories } = useCategories();

  // Stock Modal State
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [stockQty, setStockQty] = useState('');
  const [unitCost, setUnitCost] = useState('');

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            product_variants (*),
            product_images (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
      setVariants(data.product_variants?.sort((a: any, b: any) => a.color.localeCompare(b.color)) || []);
      setImages(data.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || []);
    } catch (error) {
      Alert.alert('Hata', 'Ürün bilgileri alınamadı.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: prodError } = await supabase
        .from('products')
        .update({
          name: product.name,
          base_price: parseFloat(product.base_price),
          description: product.description,
          category_id: product.category_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (prodError) throw prodError;

      Alert.alert('Başarılı', 'Ürün bilgileri güncellendi.');
      fetchProduct();
    } catch (error) {
      Alert.alert('Hata', 'Kaydetme başarısız oldu.');
    } finally {
      setSaving(false);
    }
  };

  const pickAndUploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.4,
    });

    if (!result.canceled) {
      setSaving(true);
      try {
        const uploadPromises = result.assets.map(async (asset, index) => {
          const ext = asset.uri.split('.').pop();
          const fileName = `${id}/new-${Math.random().toString(36).substring(7)}.${ext}`;
          const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, decode(base64), { contentType: `image/${ext}`, upsert: true });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
          
          return {
            product_id: id,
            url: publicUrl,
            display_order: images.length + index,
            color: variants[0]?.color || 'Genel' // Default to first variant color or Genel
          };
        });

        const newImageRecords = await Promise.all(uploadPromises);
        const { error: dbError } = await supabase.from('product_images').insert(newImageRecords);
        if (dbError) throw dbError;

        showToast('Görseller eklendi.');
        fetchProduct();
      } catch (err: any) {
        Alert.alert('Hata', 'Görsel yüklenemedi: ' + err.message);
      } finally {
        setSaving(false);
      }
    }
  };

  const deleteImage = async (imgId: string, url: string) => {
    Alert.alert("Görseli Sil", "Bu görseli kaldırmak istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => {
        setSaving(true);
        try {
          // 1. Delete from DB
          await supabase.from('product_images').delete().eq('id', imgId);
          // 2. Try delete from storage (Optional, ignore if fails)
          const path = url.split('product-images/').pop();
          if (path) await supabase.storage.from('product-images').remove([path]);
          
          fetchProduct();
        } catch (e) {
          Alert.alert('Hata', 'Görsel silinemedi.');
        } finally {
          setSaving(false);
        }
      }}
    ]);
  };

  const handleAddStock = () => {
    if (!selectedVariant || !stockQty || !unitCost) return;
    addStock.mutate({
      variantId: selectedVariant.id,
      quantity: Number(stockQty),
      unitCost: Number(unitCost),
      description: 'Ürün Detayından Stok Girişi'
    }, {
      onSuccess: () => {
        setSelectedVariant(null);
        setStockQty('');
        setUnitCost('');
        fetchProduct();
      }
    });
  };

  const handleDelete = async () => {
    Alert.alert("Ürünü Sil", "Bu işlem geri alınamaz. Devam etmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => {
        setDeleting(true);
        try {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) throw error;
          router.back();
        } catch (e: any) {
          if (e.code === '23503') Alert.alert("Silinemez", "Bu ürünün geçmiş siparişleri var. Sadece arşivleyebilirsiniz.");
          else Alert.alert("Hata", "Silme işlemi başarısız.");
        } finally {
          setDeleting(false);
        }
      }}
    ]);
  };

  if (loading) return (
    <ScreenWrapper className="bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#000" />
    </ScreenWrapper>
  );

  return (
    <ScreenWrapper noPadding className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-neutral-50 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 rounded-full bg-neutral-50 items-center justify-center border border-neutral-100">
          <ChevronLeft size={20} color="#000" />
        </TouchableOpacity>
        <H3 className="text-base uppercase tracking-widest">Ürünü Düzenle</H3>
        <View className="flex-row gap-2">
            <TouchableOpacity
            onPress={() => toggleStatus.mutate({ id: product.id, currentStatus: product.is_active })}
            style={{ height: 40, width: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: product.is_active ? '#f5f5f5' : '#171717' }}
            >
            <Archive size={18} color={product.is_active ? '#000' : '#fff'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={{ height: 40, width: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2' }}>
              <Trash2 size={18} color="#dc2626" />
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 150 }}>
        <View className="gap-8">

          {/* 1. Görseller Bento */}
          <View className="bg-white rounded-[32px] p-6 border border-neutral-100 shadow-sm gap-6">
            <View className="flex-row items-center justify-between border-b border-neutral-50 pb-4">
                <View className="flex-row items-center gap-3">
                    <ImageIcon size={20} color="#000" />
                    <H3 className="text-lg">GÖRSELLER</H3>
                </View>
                <TouchableOpacity onPress={pickAndUploadImage} className="h-10 w-10 rounded-xl bg-neutral-900 items-center justify-center">
                    <Plus size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {images.map((img) => (
                    <View key={img.id} className="relative">
                        <Image source={{ uri: img.url }} className="h-40 w-32 rounded-2xl bg-neutral-50 border border-neutral-100" />
                        <TouchableOpacity 
                            onPress={() => deleteImage(img.id, img.url)}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-neutral-100"
                        >
                            <X size={14} color="#ef4444" />
                        </TouchableOpacity>
                        <View className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md">
                            <Text className="text-white text-[8px] font-bold uppercase">{img.color || 'Genel'}</Text>
                        </View>
                    </View>
                ))}
                {images.length === 0 && (
                    <View className="h-40 w-full items-center justify-center border-2 border-dashed border-neutral-100 rounded-[24px]">
                        <Caption>HENÜZ GÖRSEL YOK</Caption>
                    </View>
                )}
            </ScrollView>
          </View>

          {/* 2. Temel Bilgiler Bento */}
          <View className="bg-white rounded-[32px] p-6 border border-neutral-100 shadow-sm gap-6">
            <View className="flex-row items-center gap-3 border-b border-neutral-50 pb-4">
                <Tag size={20} color="#000" />
                <H3 className="text-lg">TEMEL BİLGİLER</H3>
            </View>

            <View className="gap-4">
                <AppInput label="Ürün Adı" value={product.name} onChangeText={(val) => setProduct({...product, name: val})} />
                <AppInput label="Satış Fiyatı (TL)" keyboardType="numeric" value={String(product.base_price)} onChangeText={(val) => setProduct({...product, base_price: val})} />
                
                <View>
                    <Caption className="mb-2">KATEGORİ</Caption>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {categories?.map(cat => (
                            <TouchableOpacity 
                                key={cat.id} 
                                onPress={() => setProduct({...product, category_id: cat.id})} 
                                className={`px-5 py-2.5 rounded-2xl border ${product.category_id === cat.id ? 'bg-neutral-900 border-neutral-900' : 'bg-neutral-50 border-neutral-100'}`}
                            >
                                <Text className={`text-[10px] font-bold uppercase tracking-widest ${product.category_id === cat.id ? 'text-white' : 'text-neutral-400'}`}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <AppInput label="Açıklama" multiline numberOfLines={4} value={product.description} onChangeText={(val) => setProduct({...product, description: val})} style={{ height: 100, textAlignVertical: 'top' }} />
            </View>
          </View>

          {/* 3. Varyantlar Listesi */}
          <View className="bg-white rounded-[32px] p-6 border border-neutral-100 shadow-sm gap-6">
            <View className="flex-row items-center gap-3 border-b border-neutral-50 pb-4">
                <Package size={20} color="#000" />
                <H3 className="text-lg">VARYANTLAR & STOK</H3>
            </View>
            
            {variants.map((v) => (
                <View key={v.id} className="flex-row items-center gap-3 mb-2 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                    <View className="flex-1">
                        <Body className="font-bold text-sm">{v.color}</Body>
                        <Caption>Beden: {v.size}</Caption>
                    </View>
                    <View style={{ alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, border: 1, borderColor: '#e5e5e5' }}>
                        <Text style={{ fontSize: 8, fontWeight: '900', color: '#a3a3a3' }}>STOK</Text>
                        <Text style={{ fontSize: 12, fontWeight: '900', color: '#000' }}>{v.stock}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedVariant(v)} style={{ height: 48, width: 48, borderRadius: 12, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' }}>
                        <PackagePlus size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* Stock Modal */}
      <Modal visible={!!selectedVariant} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 48, gap: 24 }}>
            <H3>GÜVENLİ STOK GİRİŞİ</H3>
            <AppInput label="Eklenecek Miktar" keyboardType="numeric" value={stockQty} onChangeText={setStockQty} autoFocus />
            <AppInput label="Birim Alış Fiyatı (TL)" keyboardType="numeric" value={unitCost} onChangeText={setUnitCost} />
            <AppButton title="GÜNCELLE" onPress={handleAddStock} />
            <AppButton title="VAZGEÇ" variant="outline" onPress={() => setSelectedVariant(null)} />
          </View>
        </View>
      </Modal>

      {/* Footer Save Button */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 border-t border-neutral-100">
        <AppButton title={saving ? "İŞLENİYOR..." : "BİLGİLERİ KAYDET"} onPress={handleSave} disabled={saving} />
      </View>
    </ScreenWrapper>
  );
}

function showToast(msg: string) {
    // Basic Alert if Toast is not setup globally
    Alert.alert("Bilgi", msg);
}
