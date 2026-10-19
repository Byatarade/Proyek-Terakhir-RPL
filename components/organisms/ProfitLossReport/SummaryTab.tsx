import React from "react";
import {
  Receipt,
  TrendingUp,
  CreditCard,
  PieChart,
  HelpCircle,
} from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { ProfitLossReportData } from "@/lib/finance/actions";

interface SummaryTabProps {
  data: ProfitLossReportData;
  onSwitchToExpensesTab: () => void;
}

export function SummaryTab({ data, onSwitchToExpensesTab }: SummaryTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      {/* Left Column (7 cols): Physical Thermal Ticket Style Financial Statement */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white border border-[var(--line)] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          {/* Ticket Notches (design.md 6.1) */}
          <div
            className="ticket-notch-left top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <div
            className="ticket-notch-right top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />

          {/* Receipt Header */}
          <div className="text-center pb-5 border-b border-dashed border-[var(--line)] space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] text-[var(--forest)] flex items-center justify-center mx-auto mb-2 border border-[var(--line)]">
              <Receipt className="w-5 h-5 text-[var(--leaf)]" />
            </div>
            <h3 className="font-heading font-bold text-lg text-zinc-950 uppercase tracking-wide">
              {data.storeName}
            </h3>
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Laporan Rekapitulasi Keuangan
            </p>
            <p className="text-[11px] font-medium text-zinc-600 mt-1">
              Periode: {data.periodLabel}
            </p>
          </div>

          {/* Financial Line Items (Formula Hierarchy) */}
          <div className="py-5 space-y-3.5 text-xs sm:text-sm font-sans">
            {/* 1. Gross Revenue */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-700">
                (+) Total Pendapatan Penjualan
              </span>
              <span className="dot-leader" aria-hidden="true" />
              <span className="font-bold text-zinc-900 tabular-nums font-mono">
                {formatRupiah(data.totalRevenue)}
              </span>
            </div>

            {/* 2. COGS */}
            <div className="flex items-center justify-between text-zinc-600">
              <span className="font-normal pl-4 text-xs">
                (−) Harga Pokok Penjualan (HPP Bahan)
              </span>
              <span className="dot-leader" aria-hidden="true" />
              <span className="font-medium text-zinc-600 tabular-nums font-mono">
                ({formatRupiah(data.totalCogs)})
              </span>
            </div>

            {/* Gross Profit Subtotal */}
            <div className="pt-2 pb-2 px-3 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
              <span className="font-semibold text-zinc-900 text-xs sm:text-sm">
                (=) LABA KOTOR (Gross Profit)
              </span>
              <span className="font-bold text-[var(--forest)] tabular-nums font-mono text-sm sm:text-base">
                {formatRupiah(data.grossProfit)}
              </span>
            </div>

            {/* 3. Operational Expenses */}
            <div className="flex items-center justify-between text-zinc-600">
              <span className="font-normal pl-4 text-xs">
                (−) Total Biaya Operasional Toko
              </span>
              <span className="dot-leader" aria-hidden="true" />
              <span className="font-medium text-red-600 tabular-nums font-mono">
                ({formatRupiah(data.totalExpenses)})
              </span>
            </div>

            {/* Perforation Divider */}
            <div className="border-b-2 border-dashed border-zinc-300 my-4" />

            {/* Final Net Profit */}
            <div
              className={cn(
                "p-4 rounded-xl border-2 flex items-center justify-between",
                data.netProfit >= 0
                  ? "bg-[var(--surface-2)] border-[var(--forest)]"
                  : "bg-red-50 border-[var(--danger)]"
              )}
            >
              <div>
                <span className="font-heading font-bold text-sm sm:text-base text-zinc-950 uppercase block">
                  TOTAL LABA BERSIH (NET)
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">
                  Laba Kotor − Biaya Operasional
                </span>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    "font-heading font-bold text-xl sm:text-2xl tabular-nums font-mono block",
                    data.netProfit >= 0
                      ? "text-[var(--forest)]"
                      : "text-red-700"
                  )}
                >
                  {formatRupiah(data.netProfit)}
                </span>
                <span className="text-[10px] font-semibold text-zinc-500 uppercase">
                  Margin: {data.netMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Receipt Footer Notes */}
          <div className="pt-4 border-t border-dashed border-[var(--line)] text-center text-[11px] text-zinc-400 font-mono">
            Pencatatan resmi data kasir & transaksi PayBuy • Sesuai Standar Akuntansi UMKM
          </div>
        </div>

        {/* Daily Trends Table */}
        <div className="bg-white border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--leaf)]" />
              <h4 className="font-heading font-bold text-sm sm:text-base text-zinc-950">
                Rincian Performa Harian
              </h4>
            </div>
            <span className="text-xs text-zinc-400">
              {data.dailyTrends.length} hari
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[var(--surface-2)] text-[var(--forest)] font-semibold border-b border-[var(--line)]">
                  <th className="py-2.5 px-3 rounded-l-[6px]">Tanggal</th>
                  <th className="py-2.5 px-2 text-right">Pesanan</th>
                  <th className="py-2.5 px-3 text-right">Penjualan</th>
                  <th className="py-2.5 px-3 text-right">HPP Modal</th>
                  <th className="py-2.5 px-3 text-right">Biaya</th>
                  <th className="py-2.5 px-3 text-right rounded-r-[6px]">
                    Laba Bersih
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.dailyTrends.map((d) => (
                  <tr
                    key={d.date}
                    className="hover:bg-zinc-50/70 transition-colors"
                  >
                    <td className="py-2 px-3 font-medium text-zinc-800 whitespace-nowrap">
                      {d.dateFormatted}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums text-zinc-500 font-mono">
                      {d.ordersCount}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-zinc-900 tabular-nums font-mono">
                      {formatRupiah(d.revenue)}
                    </td>
                    <td className="py-2 px-3 text-right text-zinc-500 tabular-nums font-mono">
                      {formatRupiah(d.cogs)}
                    </td>
                    <td className="py-2 px-3 text-right text-red-600 tabular-nums font-mono">
                      {d.expenses > 0 ? `-${formatRupiah(d.expenses)}` : "Rp 0"}
                    </td>
                    <td
                      className={cn(
                        "py-2 px-3 text-right font-bold tabular-nums font-mono whitespace-nowrap",
                        d.netProfit >= 0
                          ? "text-[var(--forest)]"
                          : "text-red-600"
                      )}
                    >
                      {formatRupiah(d.netProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column (5 cols): Payment Methods & Expense Category Share */}
      <div className="lg:col-span-5 space-y-6">
        {/* Payment Method Breakdown Card */}
        <div className="bg-white border border-[var(--line)] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[var(--blue)]" />
            <h4 className="font-heading font-bold text-sm sm:text-base text-zinc-950">
              Metode Pembayaran Pelanggan
            </h4>
          </div>

          <div className="space-y-4">
            {data.paymentMethods.map((pm) => (
              <div key={pm.method} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-800">
                    {pm.label} ({pm.count} transaksi)
                  </span>
                  <span className="font-bold text-zinc-950 font-mono tabular-nums">
                    {formatRupiah(pm.totalAmount)} ({pm.percentage}%)
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      pm.method === "qris"
                        ? "bg-[var(--blue)]"
                        : "bg-[var(--leaf)]"
                    )}
                    style={{ width: `${pm.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Category Breakdown Card */}
        <div className="bg-white border border-[var(--line)] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[var(--danger)]" />
              <h4 className="font-heading font-bold text-sm sm:text-base text-zinc-950">
                Rincian Biaya per Kategori
              </h4>
            </div>
            <button
              onClick={onSwitchToExpensesTab}
              className="text-xs font-semibold text-[var(--leaf)] hover:underline cursor-pointer"
            >
              Kelola Biaya
            </button>
          </div>

          {data.expenseCategories.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-400">
              Belum ada catatan pengeluaran di periode ini.
            </div>
          ) : (
            <div className="space-y-3">
              {data.expenseCategories.map((ec) => (
                <div key={ec.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700">
                      {ec.category} ({ec.count}×)
                    </span>
                    <span className="font-semibold text-zinc-900 font-mono tabular-nums">
                      {formatRupiah(ec.totalAmount)} ({ec.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--danger)] opacity-80"
                      style={{ width: `${ec.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Information Callout */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-zinc-600 space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--forest)]">
            <HelpCircle className="w-3.5 h-3.5 text-[var(--leaf)]" />
            <span>Bagaimana Laba Bersih Dihitung?</span>
          </div>
          <p className="leading-relaxed">
            Penjualan dari pesanan terkonfirmasi dikurangi modal harga pokok
            makanan (HPP), kemudian dikurangi total seluruh biaya operasional
            toko yang Anda catat.
          </p>
        </div>
      </div>
    </div>
  );
}
