import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCashierCatalogAction } from "@/lib/cashier/actions";
import { CashierPosStation } from "@/components/organisms/CashierPosStation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mesin Kasir (POS) - PayBuy",
  description: "Layanan kasir untuk input pesanan langsung pelanggan walk-in, pembayaran tunai/QRIS, dan penerbitan nomor antrian.",
};

export default async function DashboardPosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk?next=/dashboard/pos");
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

  // Ambil katalog produk aktif untuk mesin kasir
  const catalogRes = await getCashierCatalogAction();
  const initialCatalog = catalogRes.success && catalogRes.data ? catalogRes.data : { categories: [], products: [] };

  return (
    <CashierPosStation
      initialCatalog={initialCatalog}
      storeName={storeName}
      storeSlug={storeSlug}
    />
  );
}
