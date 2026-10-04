"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PaymentMethod } from "@/lib/types/database";

export interface ExpenseItem {
  id: string;
  store_id: string;
  spent_on: string;
  category: string;
  amount: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface SaveExpenseInput {
  spent_on: string;
  category: string;
  amount: number;
  note?: string | null;
}

export interface ProductSalesSummary {
  productId: string | null;
  productName: string;
  categoryName?: string | null;
  qtySold: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
}

export interface PaymentMethodSummary {
  method: PaymentMethod;
  label: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface ExpenseCategorySummary {
  category: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface DailyFinancialTrend {
  date: string;
  dateFormatted: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  ordersCount: number;
}

export interface ProfitLossReportData {
  startDate: string;
  endDate: string;
  preset: string;
  periodLabel: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  // Core metrics (PRD 9.13 FR-LR-02)
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMargin: number;
  totalExpenses: number;
  netProfit: number;
  netMargin: number;
  totalOrders: number;
  averageOrderValue: number;
  // Breakdowns (PRD 9.13 FR-LR-04)
  productSales: ProductSalesSummary[];
  paymentMethods: PaymentMethodSummary[];
  expenseCategories: ExpenseCategorySummary[];
  expenses: ExpenseItem[];
  dailyTrends: DailyFinancialTrend[];
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export const EXPENSE_CATEGORIES = [
  "Bahan Baku & Dapur",
  "Operasional & Kemasan",
  "Gaji & Upah Pegawai",
  "Utilitas (Listrik, Air & Gas)",
  "Sewa Tempat / Gerobak",
  "Pemasaran & Promosi",
  "Pemeliharaan Alat",
  "Lain-lain",
] as const;

/**
 * Mengambil Laporan Laba Rugi dan Biaya Toko (PRD FR-LR-02 & FR-LR-05)
 */
export async function getProfitLossReportAction(params?: {
  preset?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ActionResponse<ProfitLossReportData>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Sesi tidak ditemukan. Silakan masuk kembali." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .maybeSingle();

    const profileData = profile as { store_id?: string; role?: string } | null;

    if (!profileData?.store_id) {
      return { success: false, error: "Profil toko tidak ditemukan." };
    }

    // Role check: Only Owner can access financial profit/loss report (PRD FR-LR-05)
    if (profileData.role !== "owner") {
      return {
        success: false,
        error: "Akses ditolak. Laporan laba rugi hanya dapat diakses oleh Pemilik Toko (Owner).",
      };
    }

    // Store info
    const { data: store } = await supabase
      .from("stores")
      .select("id, name, slug")
      .eq("id", profileData.store_id)
      .single();

    if (!store) {
      return { success: false, error: "Data toko tidak ditemukan." };
    }

    const preset = params?.preset || "thisMonth";
    const now = new Date();

    let startIsoDate: string;
    let endIsoDate: string;
    let periodLabel: string;

    if (preset === "today") {
      const todayStr = now.toISOString().split("T")[0];
      startIsoDate = todayStr;
      endIsoDate = todayStr;
      periodLabel = "Hari Ini (" + new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(now) + ")";
    } else if (preset === "7days") {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 6);
      startIsoDate = past7.toISOString().split("T")[0];
      endIsoDate = now.toISOString().split("T")[0];
      periodLabel = "7 Hari Terakhir";
    } else if (preset === "30days") {
      const past30 = new Date(now);
      past30.setDate(past30.getDate() - 29);
      startIsoDate = past30.toISOString().split("T")[0];
      endIsoDate = now.toISOString().split("T")[0];
      periodLabel = "30 Hari Terakhir";
    } else if (preset === "lastMonth") {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      startIsoDate = firstDayLastMonth.toISOString().split("T")[0];
      endIsoDate = lastDayLastMonth.toISOString().split("T")[0];
      periodLabel = "Bulan Lalu (" + new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(firstDayLastMonth) + ")";
    } else if (preset === "custom" && params?.startDate && params?.endDate) {
      startIsoDate = params.startDate;
      endIsoDate = params.endDate;
      periodLabel = `Rentang: ${startIsoDate} s/d ${endIsoDate}`;
    } else {
      // Default: thisMonth
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startIsoDate = firstDayThisMonth.toISOString().split("T")[0];
      endIsoDate = now.toISOString().split("T")[0];
      periodLabel = "Bulan Ini (" + new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(now) + ")";
    }

    const admin = createAdminClient();

    // Query 1: Orders in date range with valid paid status (PRD FR-LR-03: dibayar, diproses, siap, diambil)
    const { data: ordersData, error: ordersError } = await admin
      .from("orders")
      .select(`
        id,
        store_id,
        queue_date,
        status,
        total,
        payment_method,
        paid_at,
        created_at
      `)
      .eq("store_id", store.id)
      .in("status", ["dibayar", "diproses", "siap", "diambil"])
      .gte("queue_date", startIsoDate)
      .lte("queue_date", endIsoDate)
      .order("created_at", { ascending: false });

    if (ordersError) {
      return { success: false, error: "Gagal memuat data pesanan: " + ordersError.message };
    }

    const orders = ordersData || [];
    const orderIds = orders.map((o) => o.id);

    // Query 2: Order items for those orders to calculate exact HPP and product sales
    let orderItems: Array<{
      id: string;
      order_id: string;
      product_id: string | null;
      product_name: string;
      qty: number;
      price_sell: number;
      price_cost: number;
    }> = [];

    if (orderIds.length > 0) {
      // Fetch items in batches if large or single query
      const { data: itemsData, error: itemsError } = await admin
        .from("order_items")
        .select("id, order_id, product_id, product_name, qty, price_sell, price_cost")
        .eq("store_id", store.id)
        .in("order_id", orderIds);

      if (!itemsError && itemsData) {
        orderItems = itemsData;
      }
    }

    // Query 3: Expenses in date range (PRD FR-LR-01)
    const { data: expensesData, error: expensesError } = await admin
      .from("expenses")
      .select("id, store_id, spent_on, category, amount, note, created_by, created_at")
      .eq("store_id", store.id)
      .gte("spent_on", startIsoDate)
      .lte("spent_on", endIsoDate)
      .order("spent_on", { ascending: false })
      .order("created_at", { ascending: false });

    if (expensesError) {
      return { success: false, error: "Gagal memuat pengeluaran: " + expensesError.message };
    }

    const expenses: ExpenseItem[] = expensesData || [];

    // Calculate Core Metrics (PRD 9.13 Section Rumus Laporan)
    // Penjualan = total order amount
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // HPP = sum(qty * price_cost) from immutable transaction snapshot
    const totalCogs = orderItems.reduce(
      (sum, item) => sum + (item.qty || 0) * (item.price_cost || 0),
      0
    );

    // Laba Kotor = Penjualan - HPP
    const grossProfit = totalRevenue - totalCogs;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Total Biaya Operasional = sum(expenses.amount)
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Laba Bersih = Laba Kotor - Pengeluaran Operasional
    const netProfit = grossProfit - totalExpenses;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Breakdown 1: Product Sales
    const productMap = new Map<
      string,
      {
        productId: string | null;
        productName: string;
        qtySold: number;
        totalRevenue: number;
        totalCost: number;
      }
    >();

    for (const item of orderItems) {
      const key = item.product_name || item.product_id || "Produk";
      const existing = productMap.get(key) || {
        productId: item.product_id,
        productName: item.product_name,
        qtySold: 0,
        totalRevenue: 0,
        totalCost: 0,
      };

      existing.qtySold += item.qty;
      existing.totalRevenue += item.qty * item.price_sell;
      existing.totalCost += item.qty * item.price_cost;
      productMap.set(key, existing);
    }

    const productSales: ProductSalesSummary[] = Array.from(productMap.values())
      .map((p) => {
        const pGross = p.totalRevenue - p.totalCost;
        const pMargin = p.totalRevenue > 0 ? (pGross / p.totalRevenue) * 100 : 0;
        return {
          productId: p.productId,
          productName: p.productName,
          qtySold: p.qtySold,
          totalRevenue: p.totalRevenue,
          totalCost: p.totalCost,
          grossProfit: pGross,
          profitMargin: pMargin,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Breakdown 2: Payment Method (Cash vs QRIS)
    const paymentMap = new Map<PaymentMethod, { count: number; totalAmount: number }>();
    paymentMap.set("cash", { count: 0, totalAmount: 0 });
    paymentMap.set("qris", { count: 0, totalAmount: 0 });

    for (const order of orders) {
      const current = paymentMap.get(order.payment_method) || { count: 0, totalAmount: 0 };
      current.count += 1;
      current.totalAmount += order.total || 0;
      paymentMap.set(order.payment_method, current);
    }

    const paymentMethods: PaymentMethodSummary[] = [
      {
        method: "cash",
        label: "Tunai di Kasir",
        count: paymentMap.get("cash")?.count || 0,
        totalAmount: paymentMap.get("cash")?.totalAmount || 0,
        percentage:
          totalRevenue > 0
            ? Math.round(((paymentMap.get("cash")?.totalAmount || 0) / totalRevenue) * 100)
            : 0,
      },
      {
        method: "qris",
        label: "QRIS Toko",
        count: paymentMap.get("qris")?.count || 0,
        totalAmount: paymentMap.get("qris")?.totalAmount || 0,
        percentage:
          totalRevenue > 0
            ? Math.round(((paymentMap.get("qris")?.totalAmount || 0) / totalRevenue) * 100)
            : 0,
      },
    ];

    // Breakdown 3: Expense Categories
    const expenseCatMap = new Map<string, { count: number; totalAmount: number }>();
    for (const exp of expenses) {
      const cat = exp.category || "Lain-lain";
      const existing = expenseCatMap.get(cat) || { count: 0, totalAmount: 0 };
      existing.count += 1;
      existing.totalAmount += exp.amount || 0;
      expenseCatMap.set(cat, existing);
    }

    const expenseCategories: ExpenseCategorySummary[] = Array.from(expenseCatMap.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        totalAmount: data.totalAmount,
        percentage:
          totalExpenses > 0 ? Math.round((data.totalAmount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // Breakdown 4: Daily Trends in Date Range
    // Build map for every single day from startIsoDate to endIsoDate
    const dailyMap = new Map<
      string,
      { revenue: number; cogs: number; expenses: number; ordersCount: number }
    >();

    const currDate = new Date(startIsoDate + "T00:00:00");
    const endDateObj = new Date(endIsoDate + "T00:00:00");

    while (currDate <= endDateObj) {
      const dateStr = currDate.toISOString().split("T")[0];
      dailyMap.set(dateStr, { revenue: 0, cogs: 0, expenses: 0, ordersCount: 0 });
      currDate.setDate(currDate.getDate() + 1);
    }

    // Map order items by order_id for quick COGS calculation per order
    const orderCogsMap = new Map<string, number>();
    for (const item of orderItems) {
      const curr = orderCogsMap.get(item.order_id) || 0;
      orderCogsMap.set(item.order_id, curr + (item.qty || 0) * (item.price_cost || 0));
    }

    for (const order of orders) {
      const dateStr = order.queue_date || (order.created_at ? order.created_at.split("T")[0] : "");
      if (dailyMap.has(dateStr)) {
        const d = dailyMap.get(dateStr)!;
        d.revenue += order.total || 0;
        d.cogs += orderCogsMap.get(order.id) || 0;
        d.ordersCount += 1;
      }
    }

    for (const exp of expenses) {
      const dateStr = exp.spent_on;
      if (dailyMap.has(dateStr)) {
        const d = dailyMap.get(dateStr)!;
        d.expenses += exp.amount || 0;
      }
    }

    const dailyTrends: DailyFinancialTrend[] = Array.from(dailyMap.entries()).map(
      ([dateStr, val]) => {
        const [y, m, d] = dateStr.split("-");
        const dt = new Date(Number(y), Number(m) - 1, Number(d));
        const dateFormatted = new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
        }).format(dt);

        const gProfit = val.revenue - val.cogs;
        const nProfit = gProfit - val.expenses;

        return {
          date: dateStr,
          dateFormatted,
          revenue: val.revenue,
          cogs: val.cogs,
          grossProfit: gProfit,
          expenses: val.expenses,
          netProfit: nProfit,
          ordersCount: val.ordersCount,
        };
      }
    );

    return {
      success: true,
      data: {
        startDate: startIsoDate,
        endDate: endIsoDate,
        preset,
        periodLabel,
        storeId: store.id,
        storeName: store.name,
        storeSlug: store.slug,
        totalRevenue,
        totalCogs,
        grossProfit,
        grossMargin,
        totalExpenses,
        netProfit,
        netMargin,
        totalOrders,
        averageOrderValue,
        productSales,
        paymentMethods,
        expenseCategories,
        expenses,
        dailyTrends,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kendala saat memuat laporan keuangan.",
    };
  }
}

/**
 * Mencatat pengeluaran operasional baru (PRD FR-LR-01)
 */
export async function createExpenseAction(
  input: SaveExpenseInput
): Promise<ActionResponse<ExpenseItem>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan. Silakan login kembali." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };
    if (profile.role !== "owner") {
      return { success: false, error: "Hanya Owner yang berhak mencatat pengeluaran." };
    }

    if (!input.spent_on) {
      return { success: false, error: "Tanggal pengeluaran wajib diisi." };
    }
    if (!input.category || !input.category.trim()) {
      return { success: false, error: "Kategori pengeluaran wajib dipilih." };
    }
    if (!input.amount || input.amount <= 0) {
      return { success: false, error: "Nominal pengeluaran harus lebih dari Rp 0." };
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        store_id: profile.store_id,
        spent_on: input.spent_on,
        category: input.category.trim(),
        amount: Math.round(input.amount),
        note: input.note?.trim() || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/laporan");
    revalidatePath("/dashboard");
    return { success: true, data: data as ExpenseItem };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mencatat pengeluaran.",
    };
  }
}

/**
 * Memperbarui data pengeluaran (PRD FR-LR-01)
 */
export async function updateExpenseAction(
  id: string,
  input: SaveExpenseInput
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };
    if (profile.role !== "owner") {
      return { success: false, error: "Hanya Owner yang berhak mengubah pengeluaran." };
    }

    if (!input.spent_on) return { success: false, error: "Tanggal pengeluaran wajib diisi." };
    if (!input.category || !input.category.trim()) return { success: false, error: "Kategori wajib diisi." };
    if (!input.amount || input.amount <= 0) return { success: false, error: "Nominal harus lebih dari Rp 0." };

    const { error } = await supabase
      .from("expenses")
      .update({
        spent_on: input.spent_on,
        category: input.category.trim(),
        amount: Math.round(input.amount),
        note: input.note?.trim() || null,
      })
      .eq("id", id)
      .eq("store_id", profile.store_id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/laporan");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memperbarui pengeluaran.",
    };
  }
}

/**
 * Menghapus data pengeluaran (PRD FR-LR-01)
 */
export async function deleteExpenseAction(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak ditemukan." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return { success: false, error: "Toko tidak terhubung." };
    if (profile.role !== "owner") {
      return { success: false, error: "Hanya Owner yang berhak menghapus pengeluaran." };
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("store_id", profile.store_id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/laporan");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menghapus pengeluaran.",
    };
  }
}
