import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCashierCatalogAction } from "@/lib/cashier/actions";
import { CashierPosStation } from "@/components/organisms/CashierPosStation";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-cache";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mesin Kasir (POS) - PayBuy",
  description: "Layanan kasir untuk input pesanan langsung pelanggan walk-in, pembayaran tunai/QRIS, dan penerbitan nomor antrian.",
};

export default async function DashboardPosPage() {
  const { user, profile, store } = await getAuthenticatedProfile();

  if (!user) {
    redirect("/masuk?next=/dashboard/pos");
  }

  if (!profile?.store_id) {
    redirect("/onboarding");
  }

  const storeName = store?.name || "Toko Saya";
  const storeSlug = store?.slug || "";
  const storeQris = store
    ? {
        acceptQris: store.accept_qris ?? false,
        qrisMerchantName: store.qris_merchant_name ?? null,
        qrisPayload: store.qris_payload ?? null,
      }
    : undefined;

  // Ambil katalog produk aktif untuk mesin kasir langsung menggunakan store_id
  const catalogRes = await getCashierCatalogAction(profile.store_id);
  const initialCatalog = catalogRes.success && catalogRes.data ? catalogRes.data : { categories: [], products: [] };

  return (
    <CashierPosStation
      initialCatalog={initialCatalog}
      storeName={storeName}
      storeSlug={storeSlug}
      storeQris={storeQris}
    />
  );
}
