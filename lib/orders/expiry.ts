import { createAdminClient } from "@/lib/supabase/admin";
import { OrderStatus } from "@/lib/types/database";

export interface CleanupResult {
  success: boolean;
  expiredCount: number;
  expiredOrderIds: string[];
  error?: string;
}

/**
 * Memeriksa dan memperbarui pesanan yang telah melewati batas waktu pembayaran (expires_at)
 * menjadi status 'kedaluwarsa' secara atomik dan mencatat log audit (PRD 8, 9.3 FR-ST-05, BR-04)
 *
 * @param storeId - Opsional. Jika diberikan, hanya membersihkan pesanan toko tersebut.
 */
export async function cleanupExpiredOrders(storeId?: string): Promise<CleanupResult> {
  try {
    const supabase = createAdminClient();
    const nowIso = new Date().toISOString();

    // 1. Cari semua pesanan yang masih 'menunggu_bayar' dan expires_at < waktu sekarang
    let query = supabase
      .from("orders")
      .select("id, store_id, status, expires_at")
      .eq("status", "menunggu_bayar")
      .lt("expires_at", nowIso);

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data: expiredOrders, error: findError } = await query;

    if (findError) {
      return {
        success: false,
        expiredCount: 0,
        expiredOrderIds: [],
        error: findError.message,
      };
    }

    if (!expiredOrders || expiredOrders.length === 0) {
      return {
        success: true,
        expiredCount: 0,
        expiredOrderIds: [],
      };
    }

    const orderIds = expiredOrders.map((o) => o.id);

    // 2. Perbarui status pesanan menjadi 'kedaluwarsa'
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "kedaluwarsa",
        updated_at: nowIso,
      })
      .in("id", orderIds);

    if (updateError) {
      return {
        success: false,
        expiredCount: 0,
        expiredOrderIds: [],
        error: updateError.message,
      };
    }

    // 3. Catat riwayat perubahan status ke order_status_logs (PRD 12)
    const logsToInsert = expiredOrders.map((o) => ({
      order_id: o.id,
      store_id: o.store_id,
      from_status: "menunggu_bayar" as OrderStatus,
      to_status: "kedaluwarsa" as OrderStatus,
      actor_type: "system" as const,
      note: "Pesanan otomatis kedaluwarsa karena batas waktu pembayaran habis (Auto-Expiry)",
    }));

    await supabase.from("order_status_logs").insert(logsToInsert);

    return {
      success: true,
      expiredCount: orderIds.length,
      expiredOrderIds: orderIds,
    };
  } catch (err) {
    return {
      success: false,
      expiredCount: 0,
      expiredOrderIds: [],
      error: err instanceof Error ? err.message : "Gagal membersihkan pesanan kedaluwarsa.",
    };
  }
}

/**
 * Pengecekan cepat untuk satu pesanan tunggal saat diakses oleh pelanggan via public_token
 */
export async function checkAndExpireSingleOrder(order: {
  id: string;
  store_id: string;
  status: OrderStatus;
  expires_at: string;
}): Promise<boolean> {
  if (order.status !== "menunggu_bayar") {
    return false;
  }

  const now = new Date();
  const expiryDate = new Date(order.expires_at);

  if (now.getTime() > expiryDate.getTime()) {
    try {
      const supabase = createAdminClient();
      const nowIso = now.toISOString();

      await supabase
        .from("orders")
        .update({
          status: "kedaluwarsa",
          updated_at: nowIso,
        })
        .eq("id", order.id);

      await supabase.from("order_status_logs").insert({
        order_id: order.id,
        store_id: order.store_id,
        from_status: "menunggu_bayar",
        to_status: "kedaluwarsa",
        actor_type: "system",
        note: "Pesanan otomatis kedaluwarsa saat diperiksa oleh sistem",
      });

      return true;
    } catch {
      return false;
    }
  }

  return false;
}
