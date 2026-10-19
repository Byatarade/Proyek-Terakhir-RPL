import React from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { StatCard } from "@/components/molecules/StatCard";
import { cn, formatRupiah } from "@/lib/utils";
import { ProfitLossReportData } from "@/lib/finance/actions";

interface SummaryMetricsProps {
  data: ProfitLossReportData;
}

export function SummaryMetrics({ data }: SummaryMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. Penjualan */}
      <StatCard
        label="Penjualan (Omset)"
        value={formatRupiah(data.totalRevenue)}
        subtitle={`${data.totalOrders} pesanan lunas`}
        icon={<DollarSign className="w-4 h-4 text-[var(--leaf)]" />}
      />

      {/* 2. HPP Modal Pokok */}
      <StatCard
        label="HPP (Modal Bahan)"
        value={formatRupiah(data.totalCogs)}
        subtitle="Modal pokok pesanan"
        icon={<ShoppingBag className="w-4 h-4 text-zinc-600" />}
      />

      {/* 3. Laba Kotor */}
      <StatCard
        label="Laba Kotor"
        value={formatRupiah(data.grossProfit)}
        subtitle={`Margin: ${data.grossMargin.toFixed(1)}%`}
        icon={<TrendingUp className="w-4 h-4 text-[var(--blue)]" />}
        trend={{
          value: `Margin ${data.grossMargin.toFixed(0)}%`,
          isPositive: data.grossProfit >= 0,
        }}
      />

      {/* 4. Pengeluaran / Biaya */}
      <StatCard
        label="Biaya & Pengeluaran"
        value={formatRupiah(data.totalExpenses)}
        subtitle={`${data.expenses.length} transaksi biaya`}
        icon={<Wallet className="w-4 h-4 text-[var(--danger)]" />}
      />

      {/* 5. Laba Bersih (Featured Hard Highlight Card) */}
      <div
        className={cn(
          "rounded-2xl p-5 border-2 flex flex-col justify-between transition-all duration-200 group relative overflow-hidden",
          data.netProfit >= 0
            ? "bg-[var(--surface-2)] border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)]"
            : "bg-red-50 border-[var(--danger)] shadow-[3px_3px_0px_var(--danger)]"
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--forest)]">
            Laba Bersih (Net)
          </span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-[6px] text-[10px] font-bold border",
              data.netProfit >= 0
                ? "bg-[var(--mint)] text-[var(--forest)] border-[var(--forest)]"
                : "bg-red-200 text-red-900 border-red-700"
            )}
          >
            {data.netMargin >= 0
              ? `Margin +${data.netMargin.toFixed(1)}%`
              : `Defisit ${data.netMargin.toFixed(1)}%`}
          </span>
        </div>

        <div className="space-y-1">
          <div
            className={cn(
              "font-heading font-bold text-2xl sm:text-[26px] tracking-tight tabular-nums leading-none",
              data.netProfit >= 0 ? "text-[var(--forest)]" : "text-red-700"
            )}
          >
            {formatRupiah(data.netProfit)}
          </div>
          <p className="text-[11px] text-zinc-600 font-medium pt-1">
            Laba Kotor − Pengeluaran
          </p>
        </div>
      </div>
    </div>
  );
}
