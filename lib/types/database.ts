export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "owner" | "admin_gudang" | "kasir" | "koki";

export type OrderStatus =
  | "menunggu_bayar"
  | "dibayar"
  | "diproses"
  | "siap"
  | "diambil"
  | "dibatalkan"
  | "kedaluwarsa";

export type PaymentMethod = "cash" | "qris";

export type PaidConfirmer = "customer" | "cashier" | "gateway";

export type StorePlan = "free" | "pro" | "maximal";

export type ActorType = "customer" | "user" | "system";

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: StorePlan;
          is_open: boolean;
          timezone: string;
          accept_cash: boolean;
          accept_qris: boolean;
          qris_payload: string | null;
          qris_merchant_name: string | null;
          order_expiry_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: StorePlan;
          is_open?: boolean;
          timezone?: string;
          accept_cash?: boolean;
          accept_qris?: boolean;
          qris_payload?: string | null;
          qris_merchant_name?: string | null;
          order_expiry_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          plan?: StorePlan;
          is_open?: boolean;
          timezone?: string;
          accept_cash?: boolean;
          accept_qris?: boolean;
          qris_payload?: string | null;
          qris_merchant_name?: string | null;
          order_expiry_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          store_id: string;
          full_name: string;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          store_id: string;
          full_name: string;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          full_name?: string;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          image_path: string | null;
          price_sell: number;
          price_cost: number;
          is_active: boolean;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          image_path?: string | null;
          price_sell: number;
          price_cost?: number;
          is_active?: boolean;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          image_path?: string | null;
          price_sell?: number;
          price_cost?: number;
          is_active?: boolean;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          store_id: string;
          queue_date: string;
          queue_number: number;
          status: OrderStatus;
          total: number;
          payment_method: PaymentMethod;
          paid_confirmed_by: PaidConfirmer | null;
          paid_at: string | null;
          public_token: string;
          expires_at: string;
          cancel_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          queue_date: string;
          queue_number: number;
          status?: OrderStatus;
          total?: number;
          payment_method: PaymentMethod;
          paid_confirmed_by?: PaidConfirmer | null;
          paid_at?: string | null;
          public_token?: string;
          expires_at: string;
          cancel_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          queue_date?: string;
          queue_number?: number;
          status?: OrderStatus;
          total?: number;
          payment_method?: PaymentMethod;
          paid_confirmed_by?: PaidConfirmer | null;
          paid_at?: string | null;
          public_token?: string;
          expires_at?: string;
          cancel_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          store_id: string;
          product_id: string | null;
          product_name: string;
          qty: number;
          price_sell: number;
          price_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          store_id: string;
          product_id?: string | null;
          product_name: string;
          qty: number;
          price_sell: number;
          price_cost?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          store_id?: string;
          product_id?: string | null;
          product_name?: string;
          qty?: number;
          price_sell?: number;
          price_cost?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      queue_counters: {
        Row: {
          store_id: string;
          queue_date: string;
          last_number: number;
        };
        Insert: {
          store_id: string;
          queue_date: string;
          last_number?: number;
        };
        Update: {
          store_id?: string;
          queue_date?: string;
          last_number?: number;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          store_id: string;
          spent_on: string;
          category: string;
          amount: number;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          spent_on?: string;
          category: string;
          amount: number;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          spent_on?: string;
          category?: string;
          amount?: number;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      order_status_logs: {
        Row: {
          id: string;
          order_id: string;
          store_id: string;
          from_status: OrderStatus | null;
          to_status: OrderStatus;
          actor_type: ActorType;
          actor_id: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          store_id: string;
          from_status?: OrderStatus | null;
          to_status: OrderStatus;
          actor_type: ActorType;
          actor_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          store_id?: string;
          from_status?: OrderStatus | null;
          to_status?: OrderStatus;
          actor_type?: ActorType;
          actor_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      v_products_staff: {
        Row: Omit<Database["public"]["Tables"]["products"]["Row"], "price_cost">;
        Relationships: [];
      };
      v_order_items_staff: {
        Row: Omit<Database["public"]["Tables"]["order_items"]["Row"], "price_cost">;
        Relationships: [];
      };
    };
    Functions: {
      current_store_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      current_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole | null;
      };
      get_public_store: {
        Args: { p_slug: string };
        Returns: {
          id: string;
          name: string;
          slug: string;
          is_open: boolean;
          accept_cash: boolean;
          accept_qris: boolean;
          qris_merchant_name: string | null;
        }[];
      };
      get_public_menu: {
        Args: { p_slug: string };
        Returns: Json;
      };
      create_order: {
        Args: {
          p_slug: string;
          p_items: { product_id: string; qty: number }[];
          p_payment_method: PaymentMethod;
        };
        Returns: {
          order_id: string;
          public_token: string;
          queue_number: number;
          queue_date: string;
          total: number;
          expires_at: string;
        };
      };
      get_order_by_token: {
        Args: { p_token: string };
        Returns: Json | null;
      };
      customer_mark_paid: {
        Args: { p_token: string };
        Returns: boolean;
      };
      customer_cancel_order: {
        Args: { p_token: string };
        Returns: boolean;
      };
      get_public_queue: {
        Args: { p_slug: string };
        Returns: number[];
      };
      set_order_status: {
        Args: {
          p_order_id: string;
          p_to_status: OrderStatus;
          p_reason?: string | null;
        };
        Returns: boolean;
      };
      report_profit_loss: {
        Args: { p_from: string; p_to: string };
        Returns: Json;
      };
    };
  };
}
