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

export interface CashierProductItem {
  id: string;
  categoryId: string | null;
  name: string;
  priceSell: number;
  isAvailable: boolean;
  imagePath: string | null;
}

export interface CashierCategoryItem {
  id: string;
  name: string;
}

export interface CashierCatalog {
  categories: CashierCategoryItem[];
  products: CashierProductItem[];
}

export interface CreateWalkinOrderInput {
  items: { productId: string; qty: number }[];
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  note?: string;
}

export interface CreatedWalkinOrderResult {
  orderId: string;
  queueNumber: number;
  total: number;
  changeAmount: number;
  publicToken: string;
}

/**
 * Mengambil katalog produk aktif untuk mesin kasir POS
 */
export async function getCashierCatalogAction(): Promise<ActionResponse<CashierCatalog>> {
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

    const [categoriesRes, productsRes] = await Promise.all([
      admin
        .from("categories")
        .select("id, name, sort_order")
        .eq("store_id", profile.store_id)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      admin
        .from("products")
        .select("id, category_id, name, price_sell, is_available, image_path")
        .eq("store_id", profile.store_id)
        .eq("is_active", true)
        .order("name", { ascending: true }),
    ]);

    const categories: CashierCategoryItem[] = (categoriesRes.data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
    }));

    const products: CashierProductItem[] = (productsRes.data || []).map((p: any) => ({
      id: p.id,
      categoryId: p.category_id,
      name: p.name,
      priceSell: p.price_sell,
      isAvailable: p.is_available,
      imagePath: p.image_path,
    }));

    return {
      success: true,
      data: {
        categories,
        products,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memuat katalog produk kasir.",
    };
  }
}

/**
 * Membuat pesanan langsung di kasir (Walk-in Order POS)
 */
export async function createCashierWalkinOrderAction(
  input: CreateWalkinOrderInput
): Promise<ActionResponse<CreatedWalkinOrderResult>> {
  try {
    const { items, paymentMethod, cashReceived } = input;
    if (!items || items.length === 0) {
      return { success: false, error: "Pilih minimal 1 menu untuk membuat pesanan." };
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

    // Dapatkan data toko untuk order_expiry
    const { data: store } = await admin
      .from("stores")
      .select("id, order_expiry_minutes")
      .eq("id", profile.store_id)
      .single();

    const productIds = items.map((i) => i.productId);
    const { data: dbProducts } = await admin
      .from("products")
      .select("id, name, price_sell, price_cost, is_available")
      .eq("store_id", profile.store_id)
      .in("id", productIds);

    const productMap = new Map((dbProducts || []).map((p: any) => [p.id, p]));

    let orderTotal = 0;
    items.forEach((item) => {
      const prod = productMap.get(item.productId);
      const price = prod?.price_sell || 0;
      orderTotal += price * item.qty;
    });

    if (orderTotal <= 0) {
      return { success: false, error: "Total pesanan tidak valid." };
    }

    let changeAmount = 0;
    if (paymentMethod === "cash" && cashReceived !== undefined) {
      if (cashReceived < orderTotal) {
        return { success: false, error: "Uang tunai yang diterima kurang dari total belanja." };
      }
      changeAmount = cashReceived - orderTotal;
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const queueDate = nowIso.split("T")[0];
    const expiryMinutes = store?.order_expiry_minutes || 60;
    const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000).toISOString();

    const publicToken =
      Math.random().toString(36).substring(2, 10) +
      Math.random().toString(36).substring(2, 10);

    // Dapatkan counter nomor antrian harian berurutan
    const { data: counter } = await admin
      .from("queue_counters")
      .select("last_number")
      .eq("store_id", profile.store_id)
      .eq("queue_date", queueDate)
      .maybeSingle();

    const nextQueueNumber = (counter?.last_number || 0) + 1;

    // Upsert queue counter
    await admin.from("queue_counters").upsert({
      store_id: profile.store_id,
      queue_date: queueDate,
      last_number: nextQueueNumber,
    });

    // Buat pesanan dengan status langsung "dibayar"
    const { data: newOrder, error: orderError } = await admin
      .from("orders")
      .insert({
        store_id: profile.store_id,
        queue_date: queueDate,
        queue_number: nextQueueNumber,
        status: "dibayar",
        total: orderTotal,
        payment_method: paymentMethod,
        paid_confirmed_by: "cashier",
        paid_at: nowIso,
        public_token: publicToken,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (orderError || !newOrder) {
      return { success: false, error: orderError?.message || "Gagal menyimpan pesanan." };
    }

    // Insert order items
    const orderItemsToInsert = items.map((item) => {
      const prod = productMap.get(item.productId);
      return {
        order_id: newOrder.id,
        store_id: profile.store_id,
        product_id: item.productId,
        product_name: prod?.name || "Item Menu",
        qty: item.qty,
        price_sell: prod?.price_sell || 0,
        price_cost: prod?.price_cost || 0,
      };
    });

    await admin.from("order_items").insert(orderItemsToInsert);

    // Catat log pesanan
    await admin.from("order_status_logs").insert({
      order_id: newOrder.id,
      store_id: profile.store_id,
      from_status: null,
      to_status: "dibayar",
      actor_type: "user",
      actor_id: user.id,
      note: "Pesanan dibuat langsung di meja kasir (Walk-in POS)",
    });

    revalidatePath("/dashboard/kasir");
    revalidatePath("/dashboard/pos");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/dapur");
    revalidatePath("/t/[slug]", "page");

    return {
      success: true,
      data: {
        orderId: newOrder.id,
        queueNumber: nextQueueNumber,
        total: orderTotal,
        changeAmount,
        publicToken,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memproses pesanan kasir.",
    };
  }
}

