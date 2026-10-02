import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCashierOrdersAction } from "@/lib/cashier/actions";
import { CashierStation } from "@/components/organisms/CashierStation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Layar Kasir & Antrian - PayBuy",
  description: "Layar kasir untuk mengonfirmasi pembayaran tunai, memanggil nomor antrian, dan memantau pesanan aktif toko.",
};

export default async function DashboardKasirPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk?next=/dashboard/kasir");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("store_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.store_id) {
    redirect("/onboarding");
  }

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug")
    .eq("id", profile.store_id)
    .maybeSingle();

  const storeName = store?.name || "Toko Saya";
  const storeSlug = store?.slug || "";

  // Ambil pesanan awal untuk kasir
  const res = await getCashierOrdersAction();
  const initialOrders = res.success && res.data ? res.data : [];

  return (
    <CashierStation
      initialOrders={initialOrders}
      storeName={storeName}
      storeSlug={storeSlug}
    />
  );
}
