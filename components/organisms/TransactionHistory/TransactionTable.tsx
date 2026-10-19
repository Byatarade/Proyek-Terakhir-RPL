import React from "react";
import { Receipt, CreditCard, Eye } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { formatRupiah } from "@/lib/utils";
import { TransactionTableProps, STATUS_CONFIG } from "./types";

export function TransactionTable({
  transactions,
  onSelectOrder,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
          <Receipt className="w-6 h-6" />
        </div>
        <h4 className="font-heading font-bold text-base text-zinc-900">
          Tidak Ada Transaksi Ditemukan
        </h4>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Coba sesuaikan filter status, metode bayar, atau rentang tanggal untuk melihat transaksi lainnya.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-[var(--surface-2)] text-[var(--forest)] font-semibold border-b border-[var(--line)]">
              <th className="py-3 px-4">No. Antrian</th>
              <th className="py-3 px-4">Waktu Transaksi</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Metode Bayar</th>
              <th className="py-3 px-4">Item Pesanan</th>
              <th className="py-3 px-4 text-right">Total Belanja</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {transactions.map((tx) => {
              const statusInfo = STATUS_CONFIG[tx.status] || {
                label: tx.status,
                variant: "neutral" as const,
              };
              const dateObj = new Date(tx.createdAt);
              const timeFormatted = new Intl.DateTimeFormat("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(dateObj);
              const dateFormatted = new Intl.DateTimeFormat("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(dateObj);

              return (
                <tr key={tx.id} className="hover:bg-zinc-50/80 transition-colors">
                  {/* Queue Number */}
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-[6px] bg-[var(--surface-2)] border-2 border-[var(--forest)] font-heading font-bold text-xs text-[var(--forest)] font-mono">
                      #{String(tx.queueNumber).padStart(3, "0")}
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-medium text-zinc-900">{timeFormatted} WIB</div>
                    <div className="text-[11px] text-zinc-400">{dateFormatted}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge variant={statusInfo.variant} size="sm">
                      {statusInfo.label}
                    </Badge>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[11px] font-semibold bg-zinc-100 border border-zinc-200 text-zinc-800">
                      {tx.paymentMethod === "qris" ? (
                        <>
                          <CreditCard className="w-3 h-3 text-[var(--blue)]" />
                          <span>QRIS</span>
                        </>
                      ) : (
                        <>
                          <Receipt className="w-3 h-3 text-[var(--leaf)]" />
                          <span>Tunai</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Order Items preview */}
                  <td className="py-3 px-4 max-w-xs truncate text-zinc-700">
                    {tx.items.map((i) => `${i.qty}× ${i.productName}`).join(", ")}
                  </td>

                  {/* Total */}
                  <td className="py-3 px-4 text-right font-bold text-zinc-950 font-mono tabular-nums text-sm whitespace-nowrap">
                    {formatRupiah(tx.total)}
                  </td>

                  {/* Detail CTA */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onSelectOrder(tx)}
                      className="px-2.5 py-1 rounded-[6px] text-xs font-semibold text-[var(--forest)] bg-[var(--surface-2)] border border-[var(--forest)] hover:bg-[var(--mint)] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Nota</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
