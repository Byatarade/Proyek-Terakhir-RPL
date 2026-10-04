"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrderStatus, PaymentMethod, PaidConfirmer, ActorType } from "@/lib/types/database";

export interface TransactionOrderItem {
  id: string;
  productId: string | null;
  productName: string;
  qty: number;
  priceSell: number;
  priceCost: number;
}

export interface TransactionStatusLog {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  actorType: ActorType;
  actorId: string | null;
  note: string | null;
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  storeId: string;
  queueDate: string;
  queueNumber: number;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod;
  paidConfirmedBy: PaidConfirmer | null;
  paidAt: string | null;
  publicToken: string;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  items: TransactionOrderItem[];
  statusLogs?: TransactionStatusLog[];
}

export interface TransactionsResponse {
  transactions: TransactionRecord[];
  totalCount: number;
  storeName: string;
  storeSlug: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Mengambil Riwayat Transaksi Toko (PRD FR-HT-01)
 */
export async function getTransactionsAction(params?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  paymentMethod?: string;
  search?: string;
  limit?: number;
}): Promise<ActionResponse<TransactionsResponse>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Sesi tidak ditemukan." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .maybeSingle();

    const profileData = profile as { store_id?: string; role?: string } | null;

    if (!profileData?.store_id) {
      return { success: false, error: "Toko tidak terhubung." };
    }

    const { data: store } = await supabase
      .from("stores")
      .select("id, name, slug")
      .eq("id", profileData.store_id)
      .single();

    if (!store) {
      return { success: false, error: "Data toko tidak ditemukan." };
    }

    const admin = createAdminClient();

    let query = admin
      .from("orders")
      .select(`
        id,
        store_id,
        queue_date,
        queue_number,
        status,
        total,
        payment_method,
        paid_confirmed_by,
        paid_at,
        public_token,
        cancel_reason,
        created_at,
        updated_at
      `)
      .eq("store_id", store.id);

    // Apply date range
    if (params?.startDate) {
      query = query.gte("queue_date", params.startDate);
    }
    if (params?.endDate) {
      query = query.lte("queue_date", params.endDate);
    }

    // Apply status filter
    if (params?.status && params.status !== "all") {
      query = query.eq("status", params.status as OrderStatus);
    }

    // Apply payment method filter
    if (params?.paymentMethod && params.paymentMethod !== "all") {
      query = query.eq("payment_method", params.paymentMethod as PaymentMethod);
    }

    // Sort newest first
    query = query.order("created_at", { ascending: false });

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    const { data: ordersData, error: ordersError } = await query;

    if (ordersError) {
      return { success: false, error: ordersError.message };
    }

    const orders = ordersData || [];
    const orderIds = orders.map((o) => o.id);

    // Fetch order items
    let orderItems: Array<{
      id: string;
      order_id: string;
      product_id: string | null;
      product_name: string;
      qty: number;
      price_sell: number;
      price_cost: number;
    }> = [];

    if (orderIds.length > 0) {
      const { data: itemsData } = await admin
        .from("order_items")
        .select("id, order_id, product_id, product_name, qty, price_sell, price_cost")
        .eq("store_id", store.id)
        .in("order_id", orderIds);

      if (itemsData) {
        orderItems = itemsData;
      }
    }

    const itemMap = new Map<string, TransactionOrderItem[]>();
    for (const item of orderItems) {
      const existing = itemMap.get(item.order_id) || [];
      existing.push({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        qty: item.qty,
        priceSell: item.price_sell,
        priceCost: item.price_cost,
      });
      itemMap.set(item.order_id, existing);
    }

    let records: TransactionRecord[] = orders.map((o) => ({
      id: o.id,
      storeId: o.store_id,
      queueDate: o.queue_date,
      queueNumber: o.queue_number,
      status: o.status,
      total: o.total,
      paymentMethod: o.payment_method,
      paidConfirmedBy: o.paid_confirmed_by,
      paidAt: o.paid_at,
      publicToken: o.public_token,
      cancelReason: o.cancel_reason,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      items: itemMap.get(o.id) || [],
    }));

    // Apply text search (queue number or token or item name)
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      records = records.filter((r) => {
        const queueStr = String(r.queueNumber).padStart(3, "0");
        const matchQueue = queueStr.includes(q) || String(r.queueNumber).includes(q);
        const matchToken = r.publicToken.toLowerCase().includes(q);
        const matchItems = r.items.some((i) => i.productName.toLowerCase().includes(q));
        return matchQueue || matchToken || matchItems;
      });
    }

    // Summary calculations
    const totalOrders = records.length;
    const completedOrders = records.filter((r) =>
      ["dibayar", "diproses", "siap", "diambil"].includes(r.status)
    ).length;
    const cancelledOrders = records.filter((r) =>
      ["dibatalkan", "kedaluwarsa"].includes(r.status)
    ).length;
    const totalRevenue = records
      .filter((r) => ["dibayar", "diproses", "siap", "diambil"].includes(r.status))
      .reduce((sum, r) => sum + (r.total || 0), 0);

    return {
      success: true,
      data: {
        transactions: records,
        totalCount: totalOrders,
        storeName: store.name,
        storeSlug: store.slug,
        summary: {
          totalRevenue,
          totalOrders,
          completedOrders,
          cancelledOrders,
        },
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memuat riwayat transaksi.",
    };
  }
}
