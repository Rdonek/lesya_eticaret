export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          display_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          display_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          display_order?: number | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string | null
          total_spent: number
          total_orders: number
          last_order_date: string | null
          segment: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          full_name?: string | null
          total_spent?: number
          total_orders?: number
          last_order_date?: string | null
          segment?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          full_name?: string | null
          total_spent?: number
          total_orders?: number
          last_order_date?: string | null
          segment?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      finances: {
        Row: {
          id: string
          type: 'income' | 'expense'
          category: 'sale' | 'shipping' | 'marketing' | 'rent' | 'salary' | 'inventory' | 'refund' | 'other'
          amount: number
          currency: string | null
          description: string | null
          date: string
          order_id: string | null
          attachment_url: string | null
          created_at: string
          created_by: string | null
          source: string
          related_id: string | null
        }
        Insert: {
          id?: string
          type: 'income' | 'expense'
          category: 'sale' | 'shipping' | 'marketing' | 'rent' | 'salary' | 'inventory' | 'refund' | 'other'
          amount: number
          currency?: string | null
          description?: string | null
          date?: string
          order_id?: string | null
          attachment_url?: string | null
          created_at?: string
          created_by?: string | null
          source?: string
          related_id?: string | null
        }
        Update: {
          id?: string
          type?: 'income' | 'expense'
          category?: 'sale' | 'shipping' | 'marketing' | 'rent' | 'salary' | 'inventory' | 'refund' | 'other'
          amount?: number
          currency?: string | null
          description?: string | null
          date?: string
          order_id?: string | null
          attachment_url?: string | null
          created_at?: string
          created_by?: string | null
          source?: string
          related_id?: string | null
        }
      }
      inventory_logs: {
        Row: {
          id: string
          product_variant_id: string
          type: 'purchase' | 'sale' | 'return' | 'adjustment'
          quantity: number
          unit_cost: number
          total_value: number
          description: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          product_variant_id: string
          type: 'purchase' | 'sale' | 'return' | 'adjustment'
          quantity: number
          unit_cost: number
          total_value: number
          description?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          product_variant_id?: string
          type?: 'purchase' | 'sale' | 'return' | 'adjustment'
          quantity?: number
          unit_cost?: number
          total_value?: number
          description?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          title: string
          body: string
          type: string
          related_id: string | null
          data: Json
          is_read: boolean
          read_at: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          body: string
          type: string
          related_id?: string | null
          data?: Json
          is_read?: boolean
          read_at?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          body?: string
          type?: string
          related_id?: string | null
          data?: Json
          is_read?: boolean
          read_at?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_name: string
          email: string
          phone: string
          address_line: string
          city: string
          postal_code: string | null
          subtotal: number
          shipping_cost: number
          total_amount: number
          status: string
          payment_id: string | null
          tracking_number: string | null
          cancelled_reason: string | null
          created_at: string
          updated_at: string
          shipping_cost_actual: number
        }
        Insert: {
          id?: string
          order_number: string
          customer_name: string
          email: string
          phone: string
          address_line: string
          city: string
          postal_code?: string | null
          subtotal: number
          shipping_cost?: number
          total_amount: number
          status: string
          payment_id?: string | null
          tracking_number?: string | null
          cancelled_reason?: string | null
          created_at?: string
          updated_at?: string
          shipping_cost_actual?: number
        }
        Update: {
          id?: string
          order_number?: string
          customer_name?: string
          email?: string
          phone?: string
          address_line?: string
          city?: string
          postal_code?: string | null
          subtotal?: number
          shipping_cost?: number
          total_amount?: number
          status?: string
          payment_id?: string | null
          tracking_number?: string | null
          cancelled_reason?: string | null
          created_at?: string
          updated_at?: string
          shipping_cost_actual?: number
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string
          size: string | null
          color: string | null
          price: number | null
          stock: number
          reserved_stock: number
          created_at: string
          cost_price: number
        }
        Insert: {
          id?: string
          product_id: string
          sku: string
          size?: string | null
          color?: string | null
          price?: number | null
          stock?: number
          reserved_stock?: number
          created_at?: string
          cost_price?: number
        }
        Update: {
          id?: string
          product_id?: string
          sku?: string
          size?: string | null
          color?: string | null
          price?: number | null
          stock?: number
          reserved_stock?: number
          created_at?: string
          cost_price?: number
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          base_price: number | null
          is_active: boolean
          created_at: string
          updated_at: string
          category_id: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          base_price?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          category_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          base_price?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          category_id?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          push_token: string | null
          full_name: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          push_token?: string | null
          full_name?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          push_token?: string | null
          full_name?: string | null
          updated_at?: string | null
        }
      }
    }
    Functions: {
      rpc_add_stock_entry: {
        Args: {
          p_variant_id: string
          p_quantity: number
          p_unit_cost: number
          p_description: string
          p_admin_id: string
        }
        Returns: Json
      }
      rpc_ship_order: {
        Args: {
          p_order_id: string
          p_tracking_number: string
          p_admin_id: string
        }
        Returns: undefined
      }
      rpc_cancel_order: {
        Args: {
          p_order_id: string
          p_reason: string
          p_admin_id: string
        }
        Returns: undefined
      }
      rpc_rollback_transaction: {
        Args: {
          p_transaction_id: string
        }
        Returns: undefined
      }
    }
  }
}
