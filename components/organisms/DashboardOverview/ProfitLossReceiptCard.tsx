import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";

interface ProfitLossReceiptCardProps {
  periodView: "today" | "month";
  currentDateFormatted: string;
  currentMonthFormatted: string;
  activeSales: number;
  activeCogs: number;
  activeGrossProfit: number;
  activeExpenses: number;
  activeNetProfit: number;
  grossMargin: number;
}

export function ProfitLossReceiptCard({
  periodView,
  currentDateFormatted,
  currentMonthFormatted,
  activeSales,
  activeCogs,
  activeGrossProfit,
  activeExpenses,
  activeNetProfit,
  grossMargin,
}: ProfitLossReceiptCardProps) {
  return (
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
  );
}
