"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrderStatus, PaymentMethod, PaidConfirmer } from "@/lib/types/database";

export interface KitchenOrderItem {
  id: string;
  name: string;
  qty: number;
}

export interface KitchenOrder {
  id: string;
  storeId: string;
  queueNumber: number;
  queueDate: string;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod;
  paidConfirmedBy: PaidConfirmer | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: KitchenOrderItem[];
}

export interface KitchenOrdersResponse {
  success: boolean;
  data?: KitchenOrder[];
  stats?: {
    waitingCooking: number;
    inProgress: number;
    readyToday: number;
  };
  error?: string;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Mengambil pesanan aktif dapur berstatus 'dibayar' dan 'diproses' (PRD FR-KT-01)
 * Diurutkan berurutan menurut waktu bayar (FIFO - yang bayar duluan dimasak duluan).
 */
export async function getKitchenOrdersAction(): Promise<KitchenOrdersResponse> {
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
    const today = new Date().toISOString().split("T")[0];

    // 1. Ambil pesanan aktif dapur: dibayar & diproses (bisa dari hari sebelumnya jika belum selesai)
    // Serta pesanan siap hari ini untuk statistik dapur
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
        created_at,
        updated_at,
        order_items (
          id,
          product_name,
          qty
        )
      `)
      .eq("store_id", profile.store_id)
      .or(`status.in.(dibayar,diproses),and(status.eq.siap,queue_date.eq.${today})`)
      .order("created_at", { ascending: true });

    if (ordersError) {
      return { success: false, error: ordersError.message };
    }

    const allKitchenOrders: KitchenOrder[] = (orders || []).map((o: any) => ({
      id: o.id,
      storeId: o.store_id,
      queueNumber: o.queue_number,
      queueDate: o.queue_date,
      status: o.status,
      total: o.total,
      paymentMethod: o.payment_method,
      paidConfirmedBy: o.paid_confirmed_by,
      paidAt: o.paid_at,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      items: (o.order_items || []).map((it: any) => ({
        id: it.id,
        name: it.product_name,
        qty: it.qty,
      })),
    }));

    // Hitung statistik pesanan dapur
    const waitingCooking = allKitchenOrders.filter((o) => o.status === "dibayar").length;
    const inProgress = allKitchenOrders.filter((o) => o.status === "diproses").length;
    const readyToday = allKitchenOrders.filter((o) => o.status === "siap").length;

    // Daftar pesanan dapur: dibayar, diproses, dan siap hari ini (untuk panggil ulang)
    const activeOrders = allKitchenOrders
      .filter((o) => o.status === "dibayar" || o.status === "diproses" || o.status === "siap")
      .sort((a, b) => {
        const statusWeight: Record<string, number> = {
          diproses: 1,
          dibayar: 2,
          siap: 3,
        };
        const weightA = statusWeight[a.status] || 99;
        const weightB = statusWeight[b.status] || 99;
        if (weightA !== weightB) return weightA - weightB;

        const timeA = new Date(a.paidAt || a.createdAt).getTime();
        const timeB = new Date(b.paidAt || b.createdAt).getTime();
        return timeA - timeB;
      });

    return {
      success: true,
      data: activeOrders,
      stats: {
        waitingCooking,
        inProgress,
        readyToday,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memuat pesanan dapur.",
    };
  }
}

/**
 * Koki menekan tombol "Mulai Masak" (dibayar -> diproses) (PRD FR-KT-03)
 */
export async function startCookingOrderAction(orderId: string): Promise<ActionResponse<void>> {
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

    if (existingOrder.status !== "dibayar") {
      return { success: false, error: "Pesanan tidak dalam status 'Sudah Dibayar'." };
    }

    const nowIso = new Date().toISOString();

    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: "diproses",
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
      from_status: "dibayar",
      to_status: "diproses",
      actor_type: "user",
      actor_id: user.id,
      note: "Koki mulai memasak pesanan",
    });

    revalidatePath("/dashboard/dapur");
    revalidatePath("/dashboard/kasir");
    revalidatePath("/dashboard");
    revalidatePath("/t/[slug]", "page");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memulai proses masak.",
    };
  }
}

/**
 * Koki menekan tombol "Tandai Siap" (diproses -> siap) (PRD FR-KT-03)
 */
export async function markOrderReadyAction(orderId: string): Promise<ActionResponse<void>> {
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
        status: "siap",
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
      to_status: "siap",
      actor_type: "user",
      actor_id: user.id,
      note: "Koki menandai pesanan selesai dimasak (Siap Diambil)",
    });

    revalidatePath("/dashboard/dapur");
    revalidatePath("/dashboard/kasir");
    revalidatePath("/dashboard");
    revalidatePath("/t/[slug]", "page");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menandai pesanan siap.",
    };
  }
}

/**
 * Panggil antrian pelanggan ke kasir / konter (FR-KS-03)
 * Memperbarui status ke 'siap' dan updated_at agar notifikasi realtime berbunyi di ponsel pelanggan.
 */
export async function callCustomerOrderAction(
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
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };

    const admin = createAdminClient();

    const { data: existingOrder } = await admin
      .from("orders")
      .select("id, status, queue_number")
      .eq("id", orderId)
      .eq("store_id", profile.store_id)
      .single();

    if (!existingOrder) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    const nowIso = new Date().toISOString();

    // Perbarui status menjadi "siap" dan perbarui updated_at untuk broadcast realtime
    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: "siap",
        updated_at: nowIso,
      })
      .eq("id", orderId)
      .eq("store_id", profile.store_id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Catat log pemanggilan pelanggan
    await admin.from("order_status_logs").insert({
      order_id: orderId,
      store_id: profile.store_id,
      from_status: existingOrder.status,
      to_status: "siap",
      actor_type: "user",
      actor_id: user.id,
      note: `Panggilan antrian #${existingOrder.queue_number} untuk pelanggan di kasir`,
    });

    revalidatePath("/dashboard/dapur");
    revalidatePath("/dashboard/kasir");
    revalidatePath("/t/[slug]", "page");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memanggil pelanggan.",
    };
  }
}

export interface PublicQueueData {
  storeName: string;
  storeSlug: string;
  cookingNumbers: number[];
  readyNumbers: number[];
  lastCalledNumber: number | null;
}

/**
 * Mengambil daftar antrian publik untuk layar monitor antrian toko (/t/[slug]/antrian)
 * (PRD FR-KS-05 & design.md 14)
 */
export async function getPublicQueueAction(
  slug: string
): Promise<ActionResponse<PublicQueueData>> {
  try {
    const admin = createAdminClient();
    const normalizedSlug = slug.toLowerCase().trim();

    const { data: store, error: storeError } = await admin
      .from("stores")
      .select("id, name, slug")
      .eq("slug", normalizedSlug)
      .maybeSingle();

    if (storeError || !store) {
      // Fallback demo queue numbers jika toko belum tersimpan
      return {
        success: true,
        data: {
          storeName: slug.replace(/-/g, " ").toUpperCase(),
          storeSlug: normalizedSlug,
          cookingNumbers: [14, 15, 17],
          readyNumbers: [11, 12, 13],
          lastCalledNumber: 13,
        },
      };
    }

    const today = new Date().toISOString().split("T")[0];

    // Ambil pesanan aktif hari ini
    const { data: orders, error: ordersError } = await admin
      .from("orders")
      .select("queue_number, status, updated_at")
      .eq("store_id", store.id)
      .eq("queue_date", today)
      .in("status", ["dibayar", "diproses", "siap"])
      .order("updated_at", { ascending: false });

    if (ordersError) {
      return { success: false, error: ordersError.message };
    }

    const cookingNumbers: number[] = [];
    const readyNumbers: number[] = [];

    (orders || []).forEach((o: any) => {
      if (o.status === "dibayar" || o.status === "diproses") {
        cookingNumbers.push(o.queue_number);
      } else if (o.status === "siap") {
        readyNumbers.push(o.queue_number);
      }
    });

    // Nomor yang paling baru diubah ke status siap
    const lastCalledNumber = readyNumbers.length > 0 ? readyNumbers[0] : null;

    // Urutkan nomor antrian
    cookingNumbers.sort((a, b) => a - b);
    readyNumbers.sort((a, b) => a - b);

    return {
      success: true,
      data: {
        storeName: store.name,
        storeSlug: store.slug,
        cookingNumbers,
        readyNumbers,
        lastCalledNumber,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memuat antrian publik.",
    };
  }
}
