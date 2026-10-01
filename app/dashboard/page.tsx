import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DashboardOverview } from "@/components/organisms";

export const metadata: Metadata = {
  title: "Beranda Dashboard - PayBuy",
  description: "Ringkasan penjualan dan operasional toko hari ini.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("store_id, role")
    .eq("id", user?.id || "")
    .maybeSingle();

  let store: { name: string; slug: string; is_open: boolean } | null = null;
  let todaySales = 0;
  let todayOrdersCount = 0;
  let activeOrdersCount = 0;

  if (profile?.store_id) {
    const { data: storeData } = await supabase
      .from("stores")
      .select("name, slug, is_open")
      .eq("id", profile.store_id)
      .maybeSingle();
    store = storeData;

    // Calculate today's stats based on midnight timestamp
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: orders } = await supabase
      .from("orders")
      .select("total, status, created_at")
      .eq("store_id", profile.store_id)
      .gte("created_at", todayStart.toISOString());

    if (orders) {
      todayOrdersCount = orders.length;
      todaySales = orders
        .filter((o) =>
          ["dibayar", "diproses", "siap", "diambil"].includes(o.status)
        )
        .reduce((sum, o) => sum + (o.total || 0), 0);
      activeOrdersCount = orders.filter((o) =>
        ["menunggu_bayar", "dibayar", "diproses", "siap"].includes(o.status)
      ).length;
    }
  }

  return (
    <DashboardOverview
      storeName={store?.name || "Toko Saya"}
      storeSlug={store?.slug || ""}
      isOpen={store?.is_open ?? true}
      role={profile?.role || "owner"}
      todaySales={todaySales}
      todayOrdersCount={todayOrdersCount}
      activeOrdersCount={activeOrdersCount}
    />
  );
}
