import { Body, Caption, H3 } from '@/components/ui/Typography';
import type { TransformedProduct } from '@/hooks/use-products';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/format'; // Assuming we'll create this or use a simple one
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ShoppingBag } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';

type ProductCardProps = {
  product: TransformedProduct;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/product/${product.slug}?renk=${encodeURIComponent(product.displayColor)}` as any);
  };

  const handleQuickAdd = () => {
    // This will eventually open the variant sheet
    console.log('Quick add pressed for:', product.name);
  };

  return (
    <View className={cn("flex-1", className)}>
      <Pressable onPress={handlePress} className="active:opacity-90 transition-opacity">
        <View className="flex-col gap-3">
          
          {/* Image Container */}
          <View className="relative aspect-[3/4.2] w-full overflow-hidden rounded-[24px] bg-card border border-border/50 shadow-sm">
            <Image
              source={product.image}
              contentFit="cover"
              transition={500}
              style={{ width: '100%', height: '100%' }}
            />
            
            {/* Quick Add Button */}
            <Pressable 
              onPress={handleQuickAdd}
              className="absolute bottom-3 right-3 h-10 w-10 bg-background/90 rounded-full items-center justify-center shadow-lg shadow-black/10 active:scale-90"
            >
              <ShoppingBag size={18} color="#000000" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Product Info */}
          <View className="px-1 gap-0.5">
            <View className="flex-row justify-between items-start gap-2">
              <View className="flex-1">
                <H3 className="text-[13px] font-bold tracking-tight line-clamp-1">
                  {product.name}
                </H3>
                <Caption className="text-[9px] tracking-[0.2em]">
                  {product.displayColor}
                </Caption>
              </View>
              <Body className="text-[13px] font-black tracking-tighter">
                {formatPrice(product.price)}
              </Body>
            </View>
          </View>

        </View>
      </Pressable>
    </View>
  );
}
