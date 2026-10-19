import React from "react";
import { formatRupiah } from "@/lib/utils";
import { TransactionStatCardsProps } from "./types";

export function TransactionStatCards({
  totalOrders,
  completedOrders,
  cancelledOrders,
  totalRevenue,
}: TransactionStatCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div className="p-4 rounded-xl border border-[var(--line)] bg-zinc-50/60 space-y-1">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
          Total Transaksi
        </span>
        <div className="font-heading font-bold text-xl text-zinc-950 tabular-nums">
          {totalOrders} Pesanan
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[var(--line)] bg-zinc-50/60 space-y-1">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
          Pesanan Sukses
        </span>
        <div className="font-heading font-bold text-xl text-[var(--forest)] tabular-nums">
          {completedOrders} Selesai
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[var(--line)] bg-zinc-50/60 space-y-1">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
          Dibatalkan / Batal
        </span>
        <div className="font-heading font-bold text-xl text-red-600 tabular-nums">
          {cancelledOrders} Batal
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] space-y-1">
        <span className="text-[11px] font-semibold text-[var(--forest)] uppercase tracking-wide">
          Total Nilai Transaksi
        </span>
        <div className="font-heading font-bold text-xl text-[var(--forest)] font-mono tabular-nums">
          {formatRupiah(totalRevenue)}
        </div>
      </div>
    </div>
  );
}
