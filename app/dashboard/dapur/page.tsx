import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getKitchenOrdersAction } from "@/lib/kitchen/actions";
import { KitchenDisplay } from "@/components/organisms/KitchenDisplay";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-cache";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Layar Dapur - PayBuy",
  description: "Layar monitor dapur untuk koki memproses dan menandai pesanan yang sudah dibayar.",
};

export default async function DashboardDapurPage() {
  const { user, profile, store } = await getAuthenticatedProfile();

  if (!user) {
    redirect("/masuk?next=/dashboard/dapur");
  }

  if (!profile?.store_id) {
    redirect("/onboarding");
  }

  // PRD Bagian 10: Hanya Owner dan Koki yang berhak ke Layar Dapur
  if (profile.role !== "owner" && profile.role !== "koki") {
    redirect("/dashboard");
  }

  const storeName = store?.name || "Toko Saya";
  const storeSlug = store?.slug || "";

  // Ambil pesanan aktif dapur (dibayar & diproses) langsung menggunakan store_id
  const kitchenRes = await getKitchenOrdersAction(profile.store_id);
  const initialOrders = kitchenRes.success && kitchenRes.data ? kitchenRes.data : [];

  return (
    <KitchenDisplay
      initialOrders={initialOrders}
      storeName={storeName}
      storeSlug={storeSlug}
    />
  );
}
