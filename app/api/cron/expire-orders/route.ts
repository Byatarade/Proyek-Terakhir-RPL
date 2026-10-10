import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredOrders } from "@/lib/orders/expiry";

export const dynamic = "force-dynamic";

/**
 * Endpoint Cron untuk membersihkan pesanan yang sudah kedaluwarsa (PRD BR-04)
 * Dapat dipanggil secara berkala oleh Vercel Cron, Supabase pg_cron, atau scheduler lainnya.
 */
export async function GET(request: NextRequest) {
  try {
    // Validasi token rahasia jika CRON_SECRET dikonfigurasi di environment
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await cleanupExpiredOrders();

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      expiredCount: result.expiredCount,
      expiredOrderIds: result.expiredOrderIds,
      error: result.error,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Gagal menjalankan cron auto-expiry.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
