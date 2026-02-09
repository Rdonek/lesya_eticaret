export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/urunler',
  CART: '/sepet',
  CHECKOUT: '/odeme',
  ORDER_SUCCESS: (id: string) => `/siparis/${id}`,
  ADMIN: {
    ORDERS: '/admin/siparisler',
    ORDER_DETAIL: (id: string) => `/admin/siparisler/${id}`,
    PRODUCTS: '/admin/urunler',
    NEW_PRODUCT: '/admin/urunler/yeni',
    EDIT_PRODUCT: (id: string) => `/admin/urunler/${id}`,
  }
} as const;
