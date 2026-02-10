export type NotificationType =
  | 'order_new'
  | 'order_status_change'
  | 'order_delayed'
  | 'return_request'
  | 'payment_failed'
  | 'stock_critical'
  | 'stock_out'
  | 'stock_low'
  | 'finance_loss'
  | 'finance_low_margin'
  | 'finance_daily_report'
  | 'crm_vip_customer'
  | 'crm_high_ltv'
  | 'marketing_campaign'
  | 'system_alert'
  | 'manual';

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  body: string;
  type: NotificationType;
  related_id: string | null;
  data: {
    action?: 'open_order' | 'open_product' | 'open_customer' | 'open_finance';
    [key: string]: any;
  };
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  created_by: string | null;
}

export interface NotificationIconConfig {
  icon: any; // Lucide icon component
  color: string;
  bgClass: string;
}
