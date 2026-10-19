import React from "react";
import { BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn, formatRupiah } from "@/lib/utils";
import { ProfitLossSectionProps } from "./types";
import { ProfitLossReceiptCard } from "./ProfitLossReceiptCard";
import { RecentExpensesList } from "./RecentExpensesList";

export function ProfitLossSection({
  periodView,
  setPeriodView,
  currentMonthFormatted,
  currentDateFormatted,
  activeSales,
  activeCogs,
  activeGrossProfit,
  activeExpenses,
  activeNetProfit,
  activeOrders,
  grossMargin,
  netMargin,
  recentExpenses,
  topProducts,
  onOpenQuickExpense,
}: ProfitLossSectionProps) {
  return (
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
            onClick={onOpenQuickExpense}
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

        {/* 5. Laba Bersih */}
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
        <ProfitLossReceiptCard
          periodView={periodView}
          currentDateFormatted={currentDateFormatted}
          currentMonthFormatted={currentMonthFormatted}
          activeSales={activeSales}
          activeCogs={activeCogs}
          activeGrossProfit={activeGrossProfit}
          activeExpenses={activeExpenses}
          activeNetProfit={activeNetProfit}
          grossMargin={grossMargin}
        />
        <RecentExpensesList
          recentExpenses={recentExpenses}
          topProducts={topProducts}
          onOpenQuickExpense={onOpenQuickExpense}
        />
      </div>
    </div>
  );
}
