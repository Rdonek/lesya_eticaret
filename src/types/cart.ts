export type CartItem = {
  variantId: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  total: number;
};