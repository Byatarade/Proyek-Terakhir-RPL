import React from "react";
import { Receipt, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { formatRupiah } from "@/lib/utils";
import { TransactionReceiptModalProps, STATUS_CONFIG } from "./types";

export function TransactionReceiptModal({
  selectedOrder,
  onClose,
}: TransactionReceiptModalProps) {
  if (!selectedOrder) return null;

  const statusInfo = STATUS_CONFIG[selectedOrder.status] || {
    label: selectedOrder.status,
    variant: "neutral" as const,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] w-full max-w-md p-6 space-y-5 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[var(--leaf)]" />
            <h3 className="font-heading font-bold text-lg text-zinc-950">
              Rincian Transaksi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Ticket Box */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-4 relative">
          {/* Queue Header */}
          <div className="text-center pb-3 border-b border-dashed border-zinc-300 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
              Nomor Antrian
            </span>
            <div className="font-heading font-bold text-3xl text-[var(--forest)] font-mono">
              #{String(selectedOrder.queueNumber).padStart(3, "0")}
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <Badge variant={statusInfo.variant} size="sm">
                {statusInfo.label}
              </Badge>
              <span className="text-xs text-zinc-400 font-mono">
                {new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(selectedOrder.createdAt))}
              </span>
            </div>
          </div>

          {/* Items List with Dot Leaders */}
          <div className="space-y-2.5 text-xs">
            {selectedOrder.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="font-medium text-zinc-800">
                  <strong>{item.qty}×</strong> {item.productName}
                </span>
                <span className="dot-leader" aria-hidden="true" />
                <span className="font-bold text-zinc-900 font-mono tabular-nums">
                  {formatRupiah(item.qty * item.priceSell)}
                </span>
              </div>
            ))}
          </div>

          {/* Total & Payment details */}
          <div className="pt-3 border-t border-dashed border-zinc-300 space-y-2">
            <div className="flex items-center justify-between text-sm font-bold text-zinc-950">
              <span>TOTAL TAGIHAN</span>
              <span className="font-mono text-base text-[var(--forest)]">
                {formatRupiah(selectedOrder.total)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
              <span>Metode Pembayaran:</span>
              <span className="font-semibold text-zinc-800 uppercase">
                {selectedOrder.paymentMethod === "qris" ? "QRIS Toko" : "Tunai (Kasir)"}
              </span>
            </div>

            {selectedOrder.paidConfirmedBy && (
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Konfirmasi Pembayaran:</span>
                <span className="font-medium text-zinc-800 capitalize">
                  {selectedOrder.paidConfirmedBy === "customer"
                    ? "Mandiri (Pelanggan)"
                    : "Dikonfirmasi Kasir"}
                </span>
              </div>
            )}

            {selectedOrder.cancelReason && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 space-y-0.5 mt-2">
                <span className="font-semibold block">Alasan Pembatalan:</span>
                <span>{selectedOrder.cancelReason}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            className="w-full"
          >
            Tutup Nota
          </Button>
        </div>
      </div>
    </div>
  );
}
