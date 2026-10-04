import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardOverview } from "@/components/organisms";
import { ExpenseItem } from "@/lib/finance/actions";

export const metadata: Metadata = {
  title: "Beranda Dashboard - PayBuy",
  description: "Ringkasan penjualan, laba rugi, dan operasional toko hari ini.",
};

export interface DashboardProductProfit {
  productName: string;
  qtySold: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  margin: number;
}

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

  // Today metrics
  let todaySales = 0;
  let todayCogs = 0;
  let todayGrossProfit = 0;
  let todayExpenses = 0;
  let todayNetProfit = 0;
  let todayOrdersCount = 0;
  let activeOrdersCount = 0;

  // Month metrics
  let monthSales = 0;
  let monthCogs = 0;
  let monthGrossProfit = 0;
  let monthExpenses = 0;
  let monthNetProfit = 0;
  let monthOrdersCount = 0;

  // Recent data
  let recentExpenses: ExpenseItem[] = [];
  let topProducts: DashboardProductProfit[] = [];

  if (profile?.store_id) {
    const { data: storeData } = await supabase
      .from("stores")
      .select("name, slug, is_open")
      .eq("id", profile.store_id)
      .maybeSingle();
    store = storeData;

    const admin = createAdminClient();

    // Date boundaries
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    // 1. Fetch Month Orders (includes today)
    const { data: orders } = await admin
      .from("orders")
      .select("id, queue_date, total, status, payment_method, queue_number, created_at")
      .eq("store_id", profile.store_id)
      .gte("queue_date", firstDayOfMonth)
      .lte("queue_date", todayStr)
      .order("created_at", { ascending: false });

    if (orders) {
      // Active orders
      activeOrdersCount = orders.filter((o) =>
        o.queue_date === todayStr &&
        ["menunggu_bayar", "dibayar", "diproses", "siap"].includes(o.status)
      ).length;

      // Paid orders
      const paidOrders = orders.filter((o) =>
        ["dibayar", "diproses", "siap", "diambil"].includes(o.status)
      );

      // Today vs Month orders
      const todayPaidOrders = paidOrders.filter((o) => o.queue_date === todayStr);
      todayOrdersCount = orders.filter((o) => o.queue_date === todayStr).length;
      monthOrdersCount = orders.length;

      todaySales = todayPaidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      monthSales = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      const paidOrderIds = paidOrders.map((o) => o.id);

      if (paidOrderIds.length > 0) {
        // Fetch order items to calculate exact COGS and product profitability
        const { data: items } = await admin
          .from("order_items")
          .select("order_id, product_name, qty, price_sell, price_cost")
          .eq("store_id", profile.store_id)
          .in("order_id", paidOrderIds);

        if (items) {
          const todayOrderIdsSet = new Set(todayPaidOrders.map((o) => o.id));

          const productProfitMap = new Map<
            string,
            { qty: number; revenue: number; cogs: number }
          >();

          for (const item of items) {
            const isToday = todayOrderIdsSet.has(item.order_id);
            const itemCogs = (item.qty || 0) * (item.price_cost || 0);

            if (isToday) {
              todayCogs += itemCogs;
            }
            monthCogs += itemCogs;

            // Product aggregation
            const pKey = item.product_name || "Produk";
            const current = productProfitMap.get(pKey) || { qty: 0, revenue: 0, cogs: 0 };
            current.qty += item.qty || 0;
            current.revenue += (item.qty || 0) * (item.price_sell || 0);
            current.cogs += itemCogs;
            productProfitMap.set(pKey, current);
          }

          todayGrossProfit = todaySales - todayCogs;
          monthGrossProfit = monthSales - monthCogs;

          topProducts = Array.from(productProfitMap.entries())
            .map(([name, val]) => {
              const gProfit = val.revenue - val.cogs;
              const margin = val.revenue > 0 ? (gProfit / val.revenue) * 100 : 0;
              return {
                productName: name,
                qtySold: val.qty,
                revenue: val.revenue,
                cogs: val.cogs,
                grossProfit: gProfit,
                margin,
              };
            })
            .sort((a, b) => b.grossProfit - a.grossProfit)
            .slice(0, 4);
        }
      }
    }

    // 2. Fetch Expenses in current month
    const { data: expenses } = await admin
      .from("expenses")
      .select("id, store_id, spent_on, category, amount, note, created_by, created_at")
      .eq("store_id", profile.store_id)
      .gte("spent_on", firstDayOfMonth)
      .lte("spent_on", todayStr)
      .order("spent_on", { ascending: false })
      .order("created_at", { ascending: false });

    if (expenses) {
      recentExpenses = expenses.slice(0, 6) as ExpenseItem[];

      todayExpenses = expenses
        .filter((e) => e.spent_on === todayStr)
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      monthExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    }

    todayNetProfit = todayGrossProfit - todayExpenses;
    monthNetProfit = monthGrossProfit - monthExpenses;
  }

  return (
    <DashboardOverview
      storeName={store?.name || "Toko Saya"}
      storeSlug={store?.slug || ""}
      isOpen={store?.is_open ?? true}
      role={profile?.role || "owner"}
      todaySales={todaySales}
      todayCogs={todayCogs}
      todayGrossProfit={todayGrossProfit}
      todayExpenses={todayExpenses}
      todayNetProfit={todayNetProfit}
      todayOrdersCount={todayOrdersCount}
      activeOrdersCount={activeOrdersCount}
      monthSales={monthSales}
      monthCogs={monthCogs}
      monthGrossProfit={monthGrossProfit}
      monthExpenses={monthExpenses}
      monthNetProfit={monthNetProfit}
      monthOrdersCount={monthOrdersCount}
      recentExpenses={recentExpenses}
      topProducts={topProducts}
    />
  );
}
