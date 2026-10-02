"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrderStatus, PaymentMethod, PaidConfirmer } from "@/lib/types/database";

export interface CashierOrderItem {
  id: string;
  productId: string | null;
  name: string;
  qty: number;
  price: number;
}

export interface CashierOrder {
  id: string;
  storeId: string;
  queueNumber: number;
  queueDate: string;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod;
  paidConfirmedBy: PaidConfirmer | null;
  paidAt: string | null;
  publicToken: string;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  items: CashierOrderItem[];
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Mengambil daftar pesanan toko untuk layar kasir (FR-KS-01)
 */
export async function getCashierOrdersAction(): Promise<ActionResponse<CashierOrder[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Sesi tidak ditemukan. Silakan masuk kembali." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.store_id) {
      return { success: false, error: "Toko tidak terhubung ke profil Anda." };
    }

    const admin = createAdminClient();

    // Ambil pesanan hari ini dan pesanan aktif (tidak terkunci tanggal jika masih aktif)
    const today = new Date().toISOString().split("T")[0];

    const { data: orders, error: ordersError } = await admin
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
        updated_at,
        order_items (
          id,
          product_id,
          product_name,
          qty,
          price_sell
        )
      `)
      .eq("store_id", profile.store_id)
      .or(`queue_date.eq.${today},status.in.(menunggu_bayar,dibayar,diproses,siap)`)
      .order("created_at", { ascending: false });

    if (ordersError) {
      return { success: false, error: ordersError.message };
    }

    const formattedOrders: CashierOrder[] = (orders || []).map((o: any) => ({
      id: o.id,
      storeId: o.store_id,
      queueNumber: o.queue_number,
      queueDate: o.queue_date,
      status: o.status,
      total: o.total,
      paymentMethod: o.payment_method,
      paidConfirmedBy: o.paid_confirmed_by,
      paidAt: o.paid_at,
      publicToken: o.public_token,
      cancelReason: o.cancel_reason,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      items: (o.order_items || []).map((it: any) => ({
        id: it.id,
        productId: it.product_id,
        name: it.product_name,
        qty: it.qty,
        price: it.price_sell,
      })),
    }));

    return { success: true, data: formattedOrders };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memuat pesanan kasir.",
    };
  }
}

/**
 * Konfirmasi pembayaran oleh kasir (FR-KS-02 & FR-PY-06)
 */
export async function confirmOrderPaymentAction(
  orderId: string
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    const admin = createAdminClient();

    const { data: existingOrder } = await admin
      .from("orders")
      .select("id, status, payment_method, store_id")
      .eq("id", orderId)
      .eq("store_id", profile.store_id)
      .single();

    if (!existingOrder) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    const nowIso = new Date().toISOString();

    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: "dibayar",
        paid_confirmed_by: "cashier",
        paid_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", orderId)
      .eq("store_id", profile.store_id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Catat log perubahan status
    await admin.from("order_status_logs").insert({
      order_id: orderId,
      store_id: profile.store_id,
      from_status: existingOrder.status,
      to_status: "dibayar",
      actor_type: "user",
      actor_id: user.id,
      note: "Pembayaran dikonfirmasi kasir",
    });

    revalidatePath("/dashboard/kasir");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/dapur");
    revalidatePath("/t/[slug]", "page");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mengonfirmasi pembayaran.",
    };
  }
}

/**
 * Memperbarui status pesanan (misal Mulai Proses, Siap Diambil, atau Sudah Diambil)
 * (FR-KS-03 & FR-KT-02)
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    const admin = createAdminClient();

    const { data: existingOrder } = await admin
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .eq("store_id", profile.store_id)
      .single();

    if (!existingOrder) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    const nowIso = new Date().toISOString();

    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: newStatus,
        updated_at: nowIso,
      })
      .eq("id", orderId)
      .eq("store_id", profile.store_id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Catat log perubahan status
    await admin.from("order_status_logs").insert({
      order_id: orderId,
      store_id: profile.store_id,
      from_status: existingOrder.status,
      to_status: newStatus,
      actor_type: "user",
      actor_id: user.id,
      note: note || `Status diubah ke ${newStatus}`,
    });

    revalidatePath("/dashboard/kasir");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/dapur");
    revalidatePath("/t/[slug]", "page");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memperbarui status pesanan.",
    };
  }
}

/**
 * Membatalkan pesanan disertai alasan singkat (FR-KS-04)
 */
export async function cancelOrderAction(
  orderId: string,
  reason: string
): Promise<ActionResponse<void>> {
  try {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { success: false, error: "Alasan pembatalan wajib diisi." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    const admin = createAdminClient();

    const { data: existingOrder } = await admin
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .eq("store_id", profile.store_id)
      .single();

    if (!existingOrder) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    const nowIso = new Date().toISOString();

    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: "dibatalkan",
        cancel_reason: trimmedReason,
        updated_at: nowIso,
      })
      .eq("id", orderId)
      .eq("store_id", profile.store_id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Catat log pembatalan
    await admin.from("order_status_logs").insert({
      order_id: orderId,
      store_id: profile.store_id,
      from_status: existingOrder.status,
      to_status: "dibatalkan",
      actor_type: "user",
      actor_id: user.id,
      note: `Dibatalkan oleh staf: ${trimmedReason}`,
    });

    revalidatePath("/dashboard/kasir");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/dapur");
    revalidatePath("/t/[slug]", "page");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal membatalkan pesanan.",
    };
  }
}
