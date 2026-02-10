import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { H3, Body, Caption } from '@/components/ui/Typography';
import { formatPrice } from '@/utils/format';
import { useRouter } from 'expo-router';
import { ChevronRight, Box, Archive } from 'lucide-react-native';
import { CatalogProduct } from '@/hooks/use-catalog';

interface CatalogCardProps {
  product: CatalogProduct;
}

export function CatalogCard({ product }: CatalogCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity 
      onPress={() => router.push(`/catalog/${product.id}`)} // Detay sayfasına gider
      activeOpacity={0.7}
      className={`bg-white p-4 rounded-[24px] border border-neutral-100 shadow-sm mb-3 flex-row gap-4 ${!product.isActive ? 'opacity-60 bg-neutral-50' : ''}`}
    >
      {/* Image */}
      <View className="h-20 w-16 rounded-xl bg-neutral-100 overflow-hidden border border-neutral-200">
        {product.image ? (
            <Image source={{ uri: product.image }} className="h-full w-full" resizeMode="cover" />
        ) : (
            <View className="flex-1 items-center justify-center">
                <Box size={20} color="#a3a3a3" />
            </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 justify-between py-1">
        <View>
            <View className="flex-row justify-between items-start">
                <H3 className="text-sm line-clamp-1 flex-1 mr-2">{product.name}</H3>
                {!product.isActive && (
                    <View className="bg-neutral-200 px-1.5 py-0.5 rounded flex-row items-center gap-1">
                        <Archive size={10} color="#525252" />
                        <Caption className="text-[8px] text-neutral-600">ARŞİV</Caption>
                    </View>
                )}
            </View>
            <Caption className="text-neutral-400 mt-0.5 normal-case tracking-normal">
                {product.categoryName} • {product.variantsCount} Varyant
            </Caption>
        </View>

        <View className="flex-row justify-between items-end">
            <Body className="font-bold">{formatPrice(product.base_price)}</Body>
            <View className={`px-2 py-1 rounded-lg ${product.totalStock < 5 ? 'bg-red-50' : 'bg-neutral-50'}`}>
                <Caption className={product.totalStock < 5 ? 'text-red-600' : 'text-neutral-500'}>
                    {product.totalStock} STOK
                </Caption>
            </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
