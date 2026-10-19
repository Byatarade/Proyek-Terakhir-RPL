import React from "react";
import { Printer, Volume2, Plus } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
import { CreatedOrderResultState } from "./types";

interface PosSuccessOverlayProps {
  createdOrderResult: CreatedOrderResultState;
  storeName: string;
  paymentMethod: "cash" | "qris";
  parsedCashReceived: number;
  onPrintReceipt: () => void;
  onCallQueueVoice?: () => void;
  onStartNewOrder: () => void;
  onClose: () => void;
}

export function PosSuccessOverlay({
  createdOrderResult,
  storeName,
  paymentMethod,
  parsedCashReceived,
  onPrintReceipt,
  onCallQueueVoice,
  onStartNewOrder,
  onClose,
}: PosSuccessOverlayProps) {
  return (
    <div className="p-6 sm:p-10 overflow-y-auto flex flex-col items-center justify-center max-w-xl mx-auto w-full my-auto text-center space-y-6">
      {/* Ticket Notched Receipt Box */}
      <div className="w-full bg-white border-2 border-[var(--forest)] rounded-2xl shadow-[6px_6px_0px_var(--forest)] p-6 sm:p-8 relative space-y-5 text-left">
        {/* Notches on edges */}
        <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-zinc-200/80 rounded-full border-r-2 border-[var(--forest)]" />
        <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-zinc-200/80 rounded-full border-l-2 border-[var(--forest)]" />

        {/* Status Header */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-zinc-300 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--leaf)]">
              Pesanan Diterbitkan
            </span>
            <h3 className="font-heading font-extrabold text-xl text-zinc-950">
              {storeName}
            </h3>
          </div>
          <div className="px-2.5 py-1 rounded-[6px] bg-[var(--mint)] border-2 border-[var(--forest)] text-[var(--forest)] font-heading font-extrabold text-xs uppercase tracking-wider shadow-[2px_2px_0px_var(--forest)]">
            LUNAS KASIR
          </div>
        </div>

        {/* Giant Queue Number */}
        <div className="py-2 text-center bg-[var(--surface-2)] rounded-xl border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)]">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">
            Nomor Antrian Pelanggan
          </span>
          <span className="font-heading font-extrabold text-5xl sm:text-6xl text-[var(--forest)] tracking-tight">
            #{String(createdOrderResult.result.queueNumber).padStart(3, "0")}
          </span>
          <span className="text-[11px] text-[var(--leaf)] font-bold block mt-1">
            Pesanan telah masuk ke daftar antrian & dapur
          </span>
        </div>

        {/* Items Summary */}
        <div className="space-y-2 border-b-2 border-dashed border-zinc-300 pb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Item Dipesan:
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {createdOrderResult.items.map((ci, idx) => (
              <div
                key={idx}
                className="flex justify-between text-xs font-medium"
              >
                <span>
                  <strong className="text-zinc-950 font-bold">
                    {ci.qty}x
                  </strong>{" "}
                  {ci.product.name}
                </span>
                <span className="text-zinc-700 font-mono">
                  {formatRupiah(ci.product.priceSell * ci.qty)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="space-y-1.5 text-xs font-medium">
          <div className="flex justify-between text-sm font-heading font-extrabold text-zinc-950">
            <span>TOTAL BELANJA</span>
            <span className="text-[var(--forest)]">
              {formatRupiah(createdOrderResult.result.total)}
            </span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Metode Pembayaran</span>
            <span className="uppercase font-bold text-zinc-800">
              {paymentMethod}
            </span>
          </div>
          {paymentMethod === "cash" && (
            <>
              <div className="flex justify-between text-zinc-500">
                <span>Uang Diterima</span>
                <span className="font-mono text-zinc-800">
                  {formatRupiah(parsedCashReceived)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--leaf)] bg-[var(--surface-2)] p-2 rounded-lg border border-[var(--forest)]">
                <span>KEMBALIAN</span>
                <span className="font-mono font-extrabold">
                  {formatRupiah(createdOrderResult.result.changeAmount)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full">
        <Button
          variant="secondary"
          size="md"
          onClick={onPrintReceipt}
          className="gap-2 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_var(--forest)]"
        >
          <Printer className="w-4 h-4 text-[var(--forest)]" />
          <span>Cetak Struk Thermal</span>
        </Button>

        {onCallQueueVoice && (
          <Button
            variant="secondary"
            size="md"
            onClick={onCallQueueVoice}
            className="gap-2 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_var(--forest)]"
          >
            <Volume2 className="w-4 h-4 text-[var(--leaf)]" />
            <span>Panggil Antrian</span>
          </Button>
        )}

        <Button
          variant="primary"
          size="md"
          onClick={onStartNewOrder}
          className="gap-2 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_var(--forest)] bg-[var(--leaf)] hover:bg-[#156336] text-white"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Pesanan Baru</span>
        </Button>

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-zinc-500 hover:text-zinc-800 underline font-medium cursor-pointer py-1"
        >
          Selesai & Kembali ke Layar Kasir
        </button>
      </div>
    </div>
  );
}
