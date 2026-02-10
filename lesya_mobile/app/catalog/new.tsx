import { AppButton } from '@/components/ui/AppButton';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Body, Caption, H3 } from '@/components/ui/Typography';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
    Camera,
    ChevronLeft,
    Plus,
    Trash2,
    X,
    Info
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, TouchableOpacity, View, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Text } from 'react-native';

// --- Types ---
type SizeEntry = { size: string; stock: string; cost: string };
type VariantGroup = {
  id: string;
  color: string;
  images: string[];
  sizes: SizeEntry[];
};

export default function NewProductScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Variants State
  const [variants, setVariants] = useState<VariantGroup[]>([
    {
        id: Math.random().toString(),
        color: '',
        images: [],
        sizes: [
            { size: 'S', stock: '0', cost: '0' },
            { size: 'M', stock: '0', cost: '0' },
            { size: 'L', stock: '0', cost: '0' }
        ]
    }
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) {
      setCategories(data);
      if (data.length > 0) setCategoryId(data[0].id);
    }
  };

  const addVariantGroup = () => {
    setVariants(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        color: '',
        images: [],
        sizes: [
            { size: 'S', stock: '0', cost: '0' },
            { size: 'M', stock: '0', cost: '0' },
            { size: 'L', stock: '0', cost: '0' }
        ]
      }
    ]);
  };

  const removeVariantGroup = (id: string) => {
    if (variants.length === 1) return;
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  const updateSize = (variantId: string, sizeIdx: number, field: keyof SizeEntry, value: string) => {
    setVariants(prev => prev.map(v => {
        if (v.id === variantId) {
            const newSizes = [...v.sizes];
            newSizes[sizeIdx] = { ...newSizes[sizeIdx], [field]: value };
            return { ...v, sizes: newSizes };
        }
        return v;
    }));
  };

  const pickImage = async (variantId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.4, // HIGH COMPRESSION for speed
      allowsEditing: false
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setVariants(prev => prev.map(v =>
        v.id === variantId ? { ...v, images: [...v.images, ...newImages] } : v
      ));
    }
  };

  const removeImage = (variantId: string, imgUri: string) => {
    setVariants(prev => prev.map(v =>
        v.id === variantId ? { ...v, images: v.images.filter(uri => uri !== imgUri) } : v
    ));
  };

  const sanitize = (text: string) => {
    return text.toLowerCase()
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .replace(/[^a-zA-Z0-9-]/g, '-');
  };

  const handleSubmit = async () => {
    if (!name || !basePrice || !categoryId) {
      Alert.alert('Eksik Bilgi', 'Ürün adı, fiyat ve kategori seçimi zorunludur.');
      return;
    }

    setLoading(true);
    try {
      const slug = sanitize(name) + '-' + Math.floor(Math.random() * 1000);

      // 1. Create Product
      const { data: product, error: prodError } = await supabase
        .from('products')
        .insert({ name, description, base_price: parseFloat(basePrice), category_id: categoryId, slug })
        .select().single();

      if (prodError) throw prodError;

      // 2. Prepare ALL Uploads and Records
      const storagePromises: Promise<any>[] = [];
      const variantPromises: Promise<any>[] = [];

      for (const group of variants) {
        if (!group.color) continue;
        const safeColor = sanitize(group.color);

        // Queue image uploads
        group.images.forEach((uri, index) => {
            storagePromises.push((async () => {
                const ext = uri.split('.').pop();
                const fileName = `${product.id}/${safeColor}-${Math.random().toString(36).substring(7)}.${ext}`;
                const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
                
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, decode(base64), { contentType: `image/${ext}`, upsert: true });

                if (uploadError) return null;
                const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
                return { product_id: product.id, url: publicUrl, display_order: index, color: group.color };
            })());
        });

        // Queue variant creation
        for (const size of group.sizes) {
            variantPromises.push((async () => {
                const stockVal = parseInt(size.stock) || 0;
                const costVal = parseFloat(size.cost) || 0;

                const { data: variant, error: varError } = await supabase
                    .from('product_variants')
                    .insert({
                        product_id: product.id,
                        sku: `${slug}-${safeColor}-${size.size}`.toUpperCase().replace(/[^A-Z0-9-]/g, ''),
                        size: size.size,
                        color: group.color,
                        stock: stockVal,
                        cost_price: costVal
                    })
                    .select().single();

                if (varError) return null;

                if (stockVal > 0) {
                    const { data: log } = await supabase.from('inventory_logs').insert({
                        product_variant_id: variant.id,
                        type: 'purchase',
                        quantity: stockVal,
                        unit_cost: costVal,
                        total_value: stockVal * costVal,
                        description: 'İlk Stok Girişi'
                    }).select().single();

                    if (log) {
                        await supabase.from('finances').insert({
                            type: 'expense',
                            category: 'inventory',
                            amount: stockVal * costVal,
                            source: 'system_purchase',
                            related_id: log.id,
                            description: `Stok Alımı: ${product.name} (${group.color}/${size.size})`
                        });
                    }
                }
                return true;
            })());
        }
      }

      // Execute ALL Storage and DB operations in parallel batches
      await Promise.all(storagePromises).then(async (results) => {
          const validRecords = results.filter(r => r !== null);
          if (validRecords.length > 0) {
              await supabase.from('product_images').insert(validRecords);
          }
      });
      await Promise.all(variantPromises);

      Alert.alert('Başarılı', 'Ürün ve stoklar saniyeler içinde oluşturuldu.');
      router.replace('/(tabs)/catalog');
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper noPadding className="bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-neutral-50 bg-white">
            <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 rounded-full bg-neutral-50 items-center justify-center border border-neutral-100">
                <ChevronLeft size={20} color="#000" />
            </TouchableOpacity>
            <H3 className="text-sm font-black uppercase tracking-[0.2em]">YENİ ÜRÜN</H3>
            <View className="w-10" />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 150 }}>
            <View className="gap-6">
                <View className="bg-white rounded-[32px] p-6 border border-neutral-100 shadow-sm gap-5">
                    <H3 className="text-base">TEMEL BİLGİLER</H3>
                    <View className="gap-4">
                        <View>
                            <Caption className="ml-1 mb-1">ÜRÜN ADI</Caption>
                            <TextInput 
                                className="bg-neutral-50 rounded-2xl p-4 font-bold text-sm border border-neutral-100" 
                                value={name} 
                                onChangeText={setName} 
                                placeholder="Örn: Saten Mini Elbise"
                            />
                        </View>
                        <View>
                            <Caption className="ml-1 mb-1">SATIŞ FİYATI (TL)</Caption>
                            <TextInput 
                                className="bg-neutral-50 rounded-2xl p-4 font-black text-lg border border-neutral-100" 
                                value={basePrice} 
                                onChangeText={setBasePrice} 
                                keyboardType="numeric"
                                placeholder="0.00"
                            />
                        </View>
                        <View>
                            <Caption className="ml-1 mb-1">KATEGORİ</Caption>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                {categories.map(cat => (
                                    <TouchableOpacity 
                                        key={cat.id} 
                                        onPress={() => setCategoryId(cat.id)} 
                                        className={`px-5 py-2.5 rounded-2xl border ${categoryId === cat.id ? 'bg-neutral-900 border-neutral-900' : 'bg-white border-neutral-100'}`}
                                    >
                                        <Text className={`text-[10px] font-bold uppercase tracking-widest ${categoryId === cat.id ? 'text-white' : 'text-neutral-400'}`}>{cat.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </View>

                {variants.map((variant, vIdx) => (
                    <View key={variant.id} className="bg-white rounded-[32px] p-6 border border-neutral-100 shadow-sm gap-6 relative">
                        <View className="flex-row justify-between items-center">
                            <H3 className="text-base">RENK GRUBU #{vIdx + 1}</H3>
                            {variants.length > 1 && (
                                <TouchableOpacity onPress={() => removeVariantGroup(variant.id)} className="h-8 w-8 rounded-full bg-red-50 items-center justify-center">
                                    <Trash2 size={14} color="#ef4444" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className="gap-4">
                            <View>
                                <Caption className="ml-1 mb-1">RENK ADI</Caption>
                                <TextInput 
                                    className="bg-neutral-50 rounded-2xl p-4 font-bold text-sm border border-neutral-100" 
                                    value={variant.color} 
                                    onChangeText={(val) => setVariants(prev => prev.map(v => v.id === variant.id ? { ...v, color: val } : v))}
                                    placeholder="Örn: Siyah"
                                />
                            </View>

                            <View>
                                <Caption className="ml-1 mb-2">GÖRSELLER</Caption>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                    <TouchableOpacity onPress={() => pickImage(variant.id)} className="h-24 w-20 rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-200 items-center justify-center">
                                        <Camera size={24} color="#a3a3a3" />
                                    </TouchableOpacity>
                                    {variant.images.map((uri, i) => (
                                        <View key={i} className="relative">
                                            <Image source={{ uri }} className="h-24 w-20 rounded-2xl bg-neutral-100 border border-neutral-100" />
                                            <TouchableOpacity 
                                                onPress={() => removeImage(variant.id, uri)}
                                                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-neutral-100"
                                            >
                                                <X size={12} color="#000" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>

                            <View className="gap-3">
                                <Caption className="ml-1 uppercase">Beden / Stok / Maliyet</Caption>
                                {variant.sizes.map((size, sIdx) => (
                                    <View key={sIdx} className="flex-row items-center gap-2 bg-neutral-50 p-2 rounded-2xl border border-neutral-100/50">
                                        <View className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-neutral-100">
                                            <Text className="font-black text-xs">{size.size}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <TextInput 
                                                placeholder="Stok"
                                                keyboardType="numeric"
                                                className="h-10 px-3 bg-white rounded-xl text-xs font-bold border border-neutral-100"
                                                value={size.stock}
                                                onChangeText={(val) => updateSize(variant.id, sIdx, 'stock', val)}
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <TextInput 
                                                placeholder="Maliyet"
                                                keyboardType="numeric"
                                                className="h-10 px-3 bg-white rounded-xl text-xs font-bold border border-neutral-100"
                                                value={size.cost}
                                                onChangeText={(val) => updateSize(variant.id, sIdx, 'cost', val)}
                                            />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                ))}

                <TouchableOpacity 
                    onPress={addVariantGroup} 
                    className="h-16 rounded-[24px] border-2 border-dashed border-neutral-200 items-center justify-center flex-row gap-3 bg-white/50"
                >
                    <Plus size={20} color="#a3a3a3" />
                    <Body className="text-neutral-400 font-black text-xs tracking-widest uppercase">YENİ RENK GRUBU EKLE</Body>
                </TouchableOpacity>

            </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 border-t border-neutral-100 backdrop-blur-xl">
            <TouchableOpacity 
                onPress={handleSubmit}
                disabled={loading}
                className={`bg-neutral-900 h-16 rounded-[24px] items-center justify-center shadow-xl shadow-black/20 ${loading ? 'opacity-50' : ''}`}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-white font-black text-sm tracking-[0.2em] uppercase">ÜRÜNÜ YAYINLA</Text>
                )}
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
