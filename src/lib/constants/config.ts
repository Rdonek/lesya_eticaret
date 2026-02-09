export const CONFIG = {
  SHIPPING_COST: 30,           // Fixed 30 TL
  FREE_SHIPPING_THRESHOLD: 500, // Free if total >= 500 TL
  VAT_RATE: 0.20,              // 20% VAT
  RESERVATION_TIMEOUT_MINUTES: 15
} as const;
