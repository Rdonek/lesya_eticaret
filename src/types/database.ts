export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: number | null;
  stock: number;
  reserved_stock: number;
  created_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  address_line: string;
  city: string;
  postal_code: string | null;
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  status: string;
  payment_id: string | null;
  tracking_number: string | null;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: number;
  product_snapshot: any; // Using any for JSONB for now
  created_at: string;
};
