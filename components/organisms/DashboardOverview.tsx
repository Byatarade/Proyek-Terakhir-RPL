"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  QrCode,
  ExternalLink,
  ArrowRight,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  Receipt,
  Store,
  CheckCircle2,
  TrendingUp,
  Wallet,
  BarChart3,
  Plus,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar,
  X,
  Loader2,
  AlertCircle,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  HelpCircle,
  Tag,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  ArrowUpRight,
} from "lucide-react";
import { StatCard } from "@/components/molecules/StatCard";
import { Button } from "@/components/atoms/Button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Badge } from "@/components/atoms/Badge";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DotLeader } from "@/components/molecules/DotLeader";
import { cn, formatRupiah } from "@/lib/utils";
import {
  ExpenseItem,
  SaveExpenseInput,
  createExpenseAction,
} from "@/lib/finance/actions";
import { EXPENSE_CATEGORIES } from "@/lib/finance/constants";
import { DashboardProductProfit } from "@/app/dashboard/page";

export interface DashboardOverviewProps {
  storeName?: string;
  storeSlug: string;
  isOpen: boolean;
  role?: string;
  // Today stats
  todaySales?: number;
  todayCogs?: number;
  todayGrossProfit?: number;
  todayExpenses?: number;
  todayNetProfit?: number;
  todayOrdersCount?: number;
  activeOrdersCount?: number;
  // Month stats
  monthSales?: number;
  monthCogs?: number;
  monthGrossProfit?: number;
  monthExpenses?: number;
  monthNetProfit?: number;
  monthOrdersCount?: number;
  // Recent items
  recentExpenses?: ExpenseItem[];
  topProducts?: DashboardProductProfit[];
}

export function DashboardOverview({
  storeName = "Toko Saya",
  storeSlug,
  isOpen,
  role = "owner",
  todaySales = 0,
  todayCogs = 0,
  todayGrossProfit = 0,
  todayExpenses = 0,
  todayNetProfit = 0,
  todayOrdersCount = 0,
  activeOrdersCount = 0,
  monthSales = 0,
  monthCogs = 0,
  monthGrossProfit = 0,
  monthExpenses = 0,
  monthNetProfit = 0,
  monthOrdersCount = 0,
  recentExpenses = [],
  topProducts = [],
}: DashboardOverviewProps) {
  const [periodView, setPeriodView] = useState<"today" | "month">("today");
  const [quickExpenseModal, setQuickExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState<SaveExpenseInput>({
    spent_on: new Date().toISOString().split("T")[0],
    category: EXPENSE_CATEGORIES[0],
    amount: 50000,
    note: "",
  });
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isOwner = role === "owner";

  const currentDateFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  const currentMonthFormatted = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Period active stats
  const activeSales = periodView === "today" ? todaySales : monthSales;
  const activeCogs = periodView === "today" ? todayCogs : monthCogs;
  const activeGrossProfit = periodView === "today" ? todayGrossProfit : monthGrossProfit;
  const activeExpenses = periodView === "today" ? todayExpenses : monthExpenses;
  const activeNetProfit = periodView === "today" ? todayNetProfit : monthNetProfit;
  const activeOrders = periodView === "today" ? todayOrdersCount : monthOrdersCount;

  const grossMargin = activeSales > 0 ? (activeGrossProfit / activeSales) * 100 : 0;
  const netMargin = activeSales > 0 ? (activeNetProfit / activeSales) * 100 : 0;

  // Submit quick expense from dashboard
  const handleQuickExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.spent_on) {
      setExpenseError("Tanggal wajib diisi.");
      return;
    }
    if (expenseForm.amount <= 0) {
      setExpenseError("Nominal pengeluaran harus lebih dari Rp 0.");
      return;
    }

    startTransition(async () => {
      const res = await createExpenseAction(expenseForm);
      if (!res.success) {
        setExpenseError(res.error || "Gagal mencatat biaya.");
        return;
      }
      setQuickExpenseModal(false);
      setExpenseForm({
        spent_on: new Date().toISOString().split("T")[0],
        category: EXPENSE_CATEGORIES[0],
        amount: 50000,
        note: "",
      });
      // Force refresh page to show updated stats
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 bg-white select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 px-3 py-1 rounded-[6px] border border-zinc-200 mb-2 select-none">
            <Store className="w-3.5 h-3.5 text-[var(--leaf)]" />
            <span>{currentDateFormatted} (WIB)</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-zinc-950 tracking-tight">
            Beranda Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Pantau penjualan, rekapitulasi laba rugi, pesanan masuk, dan operasional toko {storeName}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/t/${storeSlug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="md" className="gap-2 text-xs sm:text-sm">
              <span>Menu Pelanggan</span>
              <ExternalLink className="w-4 h-4 text-zinc-500" />
            </Button>
          </Link>
          <Link href="/dashboard/qr">
            <Button variant="primary" size="md" className="gap-2 text-xs sm:text-sm">
              <QrCode className="w-4 h-4" />
              <span>QR Menu</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Quick Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Penjualan Hari Ini"
          value={formatRupiah(todaySales)}
          subtitle={`${todayOrdersCount} pesanan masuk`}
          icon={<DollarSign className="w-4 h-4 text-[var(--leaf)]" />}
        />

        {isOwner ? (
          <StatCard
            label="Laba Bersih Hari Ini"
            value={formatRupiah(todayNetProfit)}
            subtitle={`Laba Kotor: ${formatRupiah(todayGrossProfit)}`}
            icon={<TrendingUp className="w-4 h-4 text-[var(--forest)]" />}
            trend={{
              value: todayNetProfit >= 0 ? `+${formatRupiah(todayNetProfit)}` : `Defisit`,
              isPositive: todayNetProfit >= 0,
            }}
          />
        ) : (
          <StatCard
            label="Pesanan Hari Ini"
            value={`${todayOrdersCount} Pesanan`}
            subtitle="Total pesanan masuk"
            icon={<ShoppingBag className="w-4 h-4 text-[var(--blue)]" />}
          />
        )}

        <StatCard
          label="Antrian / Pesanan Aktif"
          value={`${activeOrdersCount} Antrian`}
          subtitle="Sedang dimasak / siap diambil"
          icon={<Clock className="w-4 h-4 text-[var(--amber)]" />}
        />

        <StatCard
          label="Status Operasional"
          value={isOpen ? "Toko Buka" : "Toko Tutup"}
          subtitle="Menerima pesanan QR"
          icon={<CheckCircle2 className="w-4 h-4 text-[var(--leaf)]" />}
        />
      </div>

      {/* FITUR LABA DAN RUGI PADA DASHBOARD (PRD Section 9.13 & design.md) */}
      {isOwner && (
        <div className="bg-white border-2 border-[var(--forest)] rounded-2xl p-5 sm:p-7 shadow-[4px_4px_0px_var(--forest)] space-y-6">
          {/* Header Section with Period Switcher and Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--forest)] bg-[var(--surface-2)] px-2.5 py-0.5 rounded-[6px] border border-[var(--line)]">
                <BarChart3 className="w-3.5 h-3.5 text-[var(--leaf)]" />
                <span>LAPORAN LABA RUGI (P&L)</span>
              </div>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-zinc-950">
                Fitur Laba & Rugi Toko
              </h2>
              <p className="text-xs text-zinc-500 font-normal">
                Perhitungan otomatis omset penjualan, harga pokok penjualan (HPP), laba kotor, dan pencatatan biaya operasional toko Anda.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Period Selector Tabs */}
              <div className="p-1 rounded-[8px] bg-zinc-100 border border-zinc-200 flex items-center gap-1">
                <button
                  onClick={() => setPeriodView("today")}
                  className={cn(
                    "px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer",
                    periodView === "today"
                      ? "bg-white text-[var(--forest)] shadow-xs border border-zinc-200"
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => setPeriodView("month")}
                  className={cn(
                    "px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer",
                    periodView === "month"
                      ? "bg-white text-[var(--forest)] shadow-xs border border-zinc-200"
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  Bulan Ini ({currentMonthFormatted})
                </button>
              </div>

              {/* Quick Record Expense Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setQuickExpenseModal(true)}
                className="gap-1.5 text-xs h-9"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Biaya</span>
              </Button>
            </div>
          </div>

          {/* 5 Financial Metric Cards on Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* 1. Penjualan */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                (+) Penjualan (Omset)
              </span>
              <div className="font-heading font-bold text-xl text-zinc-950 font-mono tabular-nums">
                {formatRupiah(activeSales)}
              </div>
              <span className="text-[10px] text-zinc-400 block">
                {activeOrders} pesanan lunas
              </span>
            </div>

            {/* 2. HPP */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                (−) HPP (Modal Bahan)
              </span>
              <div className="font-heading font-bold text-xl text-zinc-600 font-mono tabular-nums">
                {formatRupiah(activeCogs)}
              </div>
              <span className="text-[10px] text-zinc-400 block">
                Modal pokok pesanan
              </span>
            </div>

            {/* 3. Laba Kotor */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wide">
                  (=) Laba Kotor
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[var(--blue)] border border-blue-200">
                  {grossMargin.toFixed(0)}%
                </span>
              </div>
              <div className="font-heading font-bold text-xl text-[var(--blue)] font-mono tabular-nums">
                {formatRupiah(activeGrossProfit)}
              </div>
              <span className="text-[10px] text-zinc-400 block">
                Penjualan − Modal HPP
              </span>
            </div>

            {/* 4. Pengeluaran */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                (−) Biaya Operasional
              </span>
              <div className="font-heading font-bold text-xl text-red-600 font-mono tabular-nums">
                {formatRupiah(activeExpenses)}
              </div>
              <span className="text-[10px] text-zinc-400 block">
                Biaya yang dicatat
              </span>
            </div>

            {/* 5. Laba Bersih (Featured Hard Highlight Card) */}
            <div
              className={cn(
                "p-4 rounded-xl border-2 flex flex-col justify-between transition-all",
                activeNetProfit >= 0
                  ? "bg-[var(--surface-2)] border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                  : "bg-red-50 border-[var(--danger)] shadow-[2px_2px_0px_var(--danger)]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--forest)] uppercase tracking-wide">
                  (=) LABA BERSIH
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                    activeNetProfit >= 0
                      ? "bg-[var(--mint)] text-[var(--forest)] border-[var(--forest)]"
                      : "bg-red-200 text-red-900 border-red-700"
                  )}
                >
                  {netMargin >= 0 ? `+${netMargin.toFixed(1)}%` : `${netMargin.toFixed(1)}%`}
                </span>
              </div>
              <div
                className={cn(
                  "font-heading font-bold text-2xl font-mono tabular-nums",
                  activeNetProfit >= 0 ? "text-[var(--forest)]" : "text-red-700"
                )}
              >
                {formatRupiah(activeNetProfit)}
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">
                Laba Kotor − Biaya
              </span>
            </div>
          </div>

          {/* Grid Layout: Karcis Rekapitulasi Laba Rugi & Catatan Biaya Terakhir */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Karcis Rekapitulasi Keuangan (Physical Receipt Style) */}
            <div className="lg:col-span-7 bg-zinc-50 border border-[var(--line)] rounded-2xl p-5 sm:p-6 relative overflow-hidden">
              <div className="ticket-notch-left top-1/2 -translate-y-1/2" aria-hidden="true" />
              <div className="ticket-notch-right top-1/2 -translate-y-1/2" aria-hidden="true" />

              <div className="text-center pb-4 border-b border-dashed border-zinc-300 space-y-1">
                <h4 className="font-heading font-bold text-sm text-zinc-950 uppercase tracking-wide">
                  Karcis Rekapitulasi Laba Rugi
                </h4>
                <p className="text-[11px] font-mono text-zinc-500">
                  {periodView === "today"
                    ? `Perhitungan Hari Ini (${currentDateFormatted})`
                    : `Perhitungan Bulan Ini (${currentMonthFormatted})`}
                </p>
              </div>

              {/* Step-by-step Dot Leader Math */}
              <div className="py-4 space-y-3 text-xs font-sans">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-700">
                    (+) Total Pendapatan Penjualan
                  </span>
                  <span className="dot-leader" aria-hidden="true" />
                  <span className="font-bold text-zinc-950 font-mono tabular-nums">
                    {formatRupiah(activeSales)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-600">
                  <span className="pl-3 text-xs">
                    (−) Total Harga Pokok Penjualan (HPP)
                  </span>
                  <span className="dot-leader" aria-hidden="true" />
                  <span className="font-medium text-zinc-600 font-mono tabular-nums">
                    ({formatRupiah(activeCogs)})
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-zinc-200 flex items-center justify-between">
                  <span className="font-semibold text-zinc-900 text-xs">
                    (=) Subtotal Laba Kotor (Margin {grossMargin.toFixed(1)}%)
                  </span>
                  <span className="font-bold text-[var(--forest)] font-mono tabular-nums">
                    {formatRupiah(activeGrossProfit)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-600">
                  <span className="pl-3 text-xs">
                    (−) Total Pengeluaran & Biaya Operasional
                  </span>
                  <span className="dot-leader" aria-hidden="true" />
                  <span className="font-medium text-red-600 font-mono tabular-nums">
                    ({formatRupiah(activeExpenses)})
                  </span>
                </div>

                <div className="border-b-2 border-dashed border-zinc-300 my-2" />

                <div
                  className={cn(
                    "p-3 rounded-xl border flex items-center justify-between",
                    activeNetProfit >= 0
                      ? "bg-[var(--surface-2)] border-[var(--forest)]"
                      : "bg-red-50 border-red-300"
                  )}
                >
                  <span className="font-heading font-bold text-xs uppercase text-zinc-950">
                    TOTAL LABA BERSIH
                  </span>
                  <span
                    className={cn(
                      "font-heading font-bold text-lg font-mono tabular-nums",
                      activeNetProfit >= 0 ? "text-[var(--forest)]" : "text-red-700"
                    )}
                  >
                    {formatRupiah(activeNetProfit)}
                  </span>
                </div>
              </div>

              {/* View Full Report CTA */}
              <div className="pt-3 border-t border-dashed border-zinc-300 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-mono">
                  Sesuai Standar Akuntansi UMKM
                </span>
                <Link
                  href="/dashboard/laporan"
                  className="text-xs font-semibold text-[var(--leaf)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Buka Laporan Detail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Riwayat Biaya Terbaru & Menu Paling Menguntungkan */}
            <div className="lg:col-span-5 space-y-4">
              {/* Recent Expenses List */}
              <div className="bg-zinc-50 border border-[var(--line)] rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-[var(--danger)]" />
                    <h4 className="font-heading font-bold text-xs sm:text-sm text-zinc-950">
                      Biaya Operasional Terakhir
                    </h4>
                  </div>
                  <Link
                    href="/dashboard/laporan"
                    className="text-[11px] font-semibold text-[var(--leaf)] hover:underline"
                  >
                    Kelola Biaya
                  </Link>
                </div>

                {recentExpenses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-400 bg-white rounded-xl border border-zinc-200">
                    Belum ada pengeluaran yang dicatat bulan ini.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentExpenses.slice(0, 4).map((exp) => (
                      <div
                        key={exp.id}
                        className="p-2.5 rounded-lg bg-white border border-zinc-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <span className="font-semibold text-zinc-900 block truncate">
                            {exp.category}
                          </span>
                          <span className="text-[10px] text-zinc-400 block truncate">
                            {exp.note || exp.spent_on}
                          </span>
                        </div>
                        <span className="font-bold text-red-600 font-mono tabular-nums shrink-0">
                          {formatRupiah(exp.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setQuickExpenseModal(true)}
                  className="w-full text-xs gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Catat Pengeluaran Baru</span>
                </Button>
              </div>

              {/* Top Profitable Products */}
              {topProducts.length > 0 && (
                <div className="bg-zinc-50 border border-[var(--line)] rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-[var(--leaf)]" />
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-zinc-950">
                        Menu Paling Menguntungkan
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {topProducts.slice(0, 3).map((p) => (
                      <div
                        key={p.productName}
                        className="p-2 rounded-lg bg-white border border-zinc-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-2">
                          <span className="font-semibold text-zinc-900 block truncate">
                            {p.productName}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            Terjual {p.qtySold}×
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-[var(--forest)] font-mono tabular-nums block">
                            +{formatRupiah(p.grossProfit)}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            Margin {p.margin.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation shortcuts (POS, Riwayat Transaksi, Laporan Laba Rugi) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kasir POS */}
        <Link
          href="/dashboard/pos"
          className="bg-white border border-[var(--line)] rounded-2xl p-5 shadow-xs hover:border-[var(--forest)] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800 mb-2">
              <ShoppingBag className="w-4 h-4 text-[var(--leaf)]" />
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-950 group-hover:text-[var(--leaf)] transition-colors">
              Kasir POS (Input Menu)
            </h3>
            <p className="text-xs text-zinc-500 font-normal">
              Input pesanan manual pelanggan yang memesan langsung di meja kasir.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-semibold text-[var(--leaf)] gap-1">
            <span>Buka Kasir POS</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Riwayat Transaksi */}
        <Link
          href="/dashboard/transaksi"
          className="bg-white border border-[var(--line)] rounded-2xl p-5 shadow-xs hover:border-[var(--forest)] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800 mb-2">
              <Clock className="w-4 h-4 text-[var(--blue)]" />
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-950 group-hover:text-[var(--blue)] transition-colors">
              Riwayat Transaksi
            </h3>
            <p className="text-xs text-zinc-500 font-normal">
              Daftar seluruh pesanan masuk, nota nomor antrian, dan status pembayaran pelanggan.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-semibold text-[var(--blue)] gap-1">
            <span>Buka Riwayat Transaksi</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Laba Rugi & Biaya Detail */}
        <Link
          href="/dashboard/laporan"
          className="bg-white border border-[var(--line)] rounded-2xl p-5 shadow-xs hover:border-[var(--forest)] hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--forest)] mb-2">
              <BarChart3 className="w-4 h-4 text-[var(--leaf)]" />
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-950 group-hover:text-[var(--forest)] transition-colors">
              Laporan Finansial Lengkap
            </h3>
            <p className="text-xs text-zinc-500 font-normal">
              Analisis mendalam laba rugi, rincian biaya per kategori, dan ekspor laporan keuangan.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-semibold text-[var(--forest)] gap-1">
            <span>Buka Laporan Detail</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* MODAL: Form Catat Pengeluaran Cepat */}
      {quickExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[var(--leaf)]" />
                <h3 className="font-heading font-bold text-lg text-zinc-950">
                  Catat Pengeluaran Toko
                </h3>
              </div>
              <button
                onClick={() => setQuickExpenseModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {expenseError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{expenseError}</span>
              </div>
            )}

            <form onSubmit={handleQuickExpenseSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">
                  Tanggal Pengeluaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={expenseForm.spent_on}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, spent_on: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-sm text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">
                  Kategori Biaya <span className="text-red-500">*</span>
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, category: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-sm text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">
                  Nominal Pengeluaran (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="500"
                    placeholder="Contoh: 50000"
                    value={expenseForm.amount || ""}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        amount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full h-11 pl-10 pr-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-sm font-mono font-bold text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
                    required
                  />
                </div>
                {expenseForm.amount > 0 && (
                  <p className="text-[11px] text-[var(--leaf)] font-medium">
                    Terbaca: {formatRupiah(expenseForm.amount)}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">
                  Catatan / Keterangan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Beli telur 2kg dan minyak goreng"
                  value={expenseForm.note || ""}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, note: e.target.value })
                  }
                  className="w-full p-2.5 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[var(--line)]">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setQuickExpenseModal(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isPending}
                  className="gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Pengeluaran</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
