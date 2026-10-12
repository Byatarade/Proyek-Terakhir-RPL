import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCashierOrdersAction } from "@/lib/cashier/actions";
import { CashierStation } from "@/components/organisms/CashierStation";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-cache";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Layar Kasir & Antrian - PayBuy",
  description: "Layar kasir untuk mengonfirmasi pembayaran tunai, memanggil nomor antrian, dan memantau pesanan aktif toko.",
};

export default async function DashboardKasirPage() {
  const { user, profile, store } = await getAuthenticatedProfile();

  if (!user) {
    redirect("/masuk?next=/dashboard/kasir");
  }

  if (!profile?.store_id) {
    redirect("/onboarding");
  }

  const storeName = store?.name || "Toko Saya";
  const storeSlug = store?.slug || "";

  // Ambil pesanan antrian aktif untuk layar kasir langsung menggunakan store_id
  const ordersRes = await getCashierOrdersAction(profile.store_id);
  const initialOrders = ordersRes.success && ordersRes.data ? ordersRes.data : [];

  return (
    <CashierStation
      initialOrders={initialOrders}
      storeName={storeName}
      storeSlug={storeSlug}
    />
  );
}
