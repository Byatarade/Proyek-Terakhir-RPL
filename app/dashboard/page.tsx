import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardOverview } from "@/components/organisms";

export const metadata: Metadata = {
  title: "Beranda Dashboard - PayBuy",
  description: "Ringkasan penjualan, laba rugi, dan operasional toko hari ini.",
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
  let todayExpenses = 0;
  let todayGrossProfit = 0;
  let todayNetProfit = 0;

  if (profile?.store_id) {
    const { data: storeData } = await supabase
      .from("stores")
      .select("name, slug, is_open")
      .eq("id", profile.store_id)
      .maybeSingle();
    store = storeData;

    const admin = createAdminClient();

    // Today's date boundary (local YYYY-MM-DD)
    const todayStr = new Date().toISOString().split("T")[0];

    // Fetch today's orders
    const { data: orders } = await admin
      .from("orders")
      .select("id, total, status, payment_method, queue_number, created_at")
      .eq("store_id", profile.store_id)
      .gte("queue_date", todayStr)
      .lte("queue_date", todayStr);

    if (orders) {
      todayOrdersCount = orders.length;
      const paidOrders = orders.filter((o) =>
        ["dibayar", "diproses", "siap", "diambil"].includes(o.status)
      );

      todaySales = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      activeOrdersCount = orders.filter((o) =>
        ["menunggu_bayar", "dibayar", "diproses", "siap"].includes(o.status)
      ).length;

      const paidOrderIds = paidOrders.map((o) => o.id);
      let todayCogs = 0;

      if (paidOrderIds.length > 0) {
        const { data: items } = await admin
          .from("order_items")
          .select("qty, price_cost")
          .eq("store_id", profile.store_id)
          .in("order_id", paidOrderIds);

        if (items) {
          todayCogs = items.reduce(
            (sum, item) => sum + (item.qty || 0) * (item.price_cost || 0),
            0
          );
        }
      }

      todayGrossProfit = todaySales - todayCogs;
    }

    // Fetch today's expenses
    const { data: expenses } = await admin
      .from("expenses")
      .select("amount")
      .eq("store_id", profile.store_id)
      .eq("spent_on", todayStr);

    if (expenses) {
      todayExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    }

    todayNetProfit = todayGrossProfit - todayExpenses;
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
      todayExpenses={todayExpenses}
      todayGrossProfit={todayGrossProfit}
      todayNetProfit={todayNetProfit}
    />
  );
}
