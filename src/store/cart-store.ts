import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/cart';

type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  updateItems: (newItems: CartItem[]) => void;
  clear: () => void;
  getTotal: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) => item.variantId === newItem.variantId
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          const existingItem = updatedItems[existingItemIndex];
          
          // Stock Check: Don't exceed available stock
          const newTotalQuantity = existingItem.quantity + newItem.quantity;
          updatedItems[existingItemIndex].quantity = Math.min(newTotalQuantity, existingItem.stock);
          
          set({ items: updatedItems });
        } else {
          // Double check: ensure initial quantity doesn't exceed stock
          const safeNewItem = {
            ...newItem,
            quantity: Math.min(newItem.quantity, newItem.stock)
          };
          set({ items: [...currentItems, safeNewItem] });
        }
      },

      removeItem: (variantId) => {
        set({
          items: get().items.filter((item) => item.variantId !== variantId),
        });
      },

      updateQuantity: (variantId, quantity) => {
        const currentItems = get().items;
        const item = currentItems.find(i => i.variantId === variantId);
        
        if (!item) return;
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }

        // Clamp quantity to available stock
        const safeQuantity = Math.min(quantity, item.stock);

        set({
          items: currentItems.map((i) =>
            i.variantId === variantId ? { ...i, quantity: safeQuantity } : i
          ),
        });
      },

      updateItems: (newItems) => {
        set({ items: newItems });
      },

      clear: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);