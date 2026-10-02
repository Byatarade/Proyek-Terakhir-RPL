import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getKitchenOrdersAction } from "@/lib/kitchen/actions";
import { KitchenDisplay } from "@/components/organisms/KitchenDisplay";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Layar Dapur - PayBuy",
  description: "Layar monitor dapur untuk koki memproses dan menandai pesanan yang sudah dibayar.",
};

export default async function DashboardDapurPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk?next=/dashboard/dapur");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("store_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.store_id) {
    redirect("/onboarding");
  }

  // PRD Bagian 10: Hanya Owner dan Koki yang berhak ke Layar Dapur
  if (profile.role !== "owner" && profile.role !== "koki") {
    redirect("/dashboard");
  }

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug")
    .eq("id", profile.store_id)
    .maybeSingle();

  const storeName = store?.name || "Toko Saya";
  const storeSlug = store?.slug || "";

  // Ambil pesanan aktif dapur (dibayar & diproses)
  const kitchenRes = await getKitchenOrdersAction();
  const initialOrders = kitchenRes.success && kitchenRes.data ? kitchenRes.data : [];

  return (
    <KitchenDisplay
      initialOrders={initialOrders}
      storeName={storeName}
      storeSlug={storeSlug}
    />
  );
}
