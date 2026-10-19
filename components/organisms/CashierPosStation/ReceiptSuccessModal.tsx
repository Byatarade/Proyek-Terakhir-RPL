import React from "react";
import Link from "next/link";
import { Printer, Volume2, Plus } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
import { SuccessOrderState } from "./types";

interface ReceiptSuccessModalProps {
  successOrder: SuccessOrderState | null;
  storeName: string;
  onNewOrder: () => void;
  onCallVoice: (queueNumber: number) => void;
}

export function ReceiptSuccessModal({
  successOrder,
  storeName,
  onNewOrder,
  onCallVoice,
}: ReceiptSuccessModalProps) {
  if (!successOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
      <div className="w-full max-w-md bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Ticket Notches */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-zinc-300 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--leaf)]">
              Transaksi Selesai
            </span>
            <h3 className="font-heading font-extrabold text-xl text-zinc-950">
              {storeName}
            </h3>
          </div>
          <div className="px-2.5 py-1 rounded-[6px] bg-[var(--mint)] border-2 border-[var(--forest)] text-[var(--forest)] font-heading font-extrabold text-xs uppercase tracking-wider shadow-[2px_2px_0px_var(--forest)]">
            LUNAS KASIR
          </div>
        </div>

        {/* Jumbo Queue Number */}
        <div className="py-3 text-center bg-[var(--surface-2)] rounded-xl border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)]">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">
            Nomor Antrian Diterbitkan
          </span>
          <span className="font-heading font-extrabold text-6xl text-[var(--forest)] tracking-tight block">
            #{String(successOrder.result.queueNumber).padStart(3, "0")}
          </span>
          <span className="text-xs text-[var(--leaf)] font-bold block mt-1">
            Pesanan diteruskan ke dapur & layar antrian
          </span>
        </div>

        {/* Printable Receipt Preview Area */}
        <div
          id="printable-receipt"
          className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 font-mono text-xs text-zinc-900 space-y-2.5"
        >
          <div className="text-center border-b border-dashed border-zinc-400 pb-2">
            <div className="font-bold text-xs uppercase">{storeName}</div>
            <div className="text-[10px] text-zinc-500">Struk Pembayaran POS Kasir</div>
            <div className="text-[10px] text-zinc-500">
              {new Date(successOrder.createdAt).toLocaleString("id-ID")}
            </div>
          </div>

          <div className="space-y-1 border-b border-dashed border-zinc-400 pb-2 max-h-36 overflow-y-auto">
            {successOrder.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span>
                  {it.qty}x {it.product.name}
                </span>
                <span>{formatRupiah(it.product.priceSell * it.qty)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-0.5 text-[11px]">
            <div className="flex justify-between font-bold text-xs pt-0.5">
              <span>TOTAL:</span>
              <span>{formatRupiah(successOrder.result.total)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Metode Bayar:</span>
              <span className="uppercase">{successOrder.paidMethod}</span>
            </div>
            {successOrder.paidMethod === "cash" && (
              <>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Uang Diterima:</span>
                  <span>{formatRupiah(successOrder.cashReceived)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs text-[var(--leaf)] pt-1">
                  <span>KEMBALIAN:</span>
                  <span>{formatRupiah(successOrder.changeAmount)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => window.print()}
              className="gap-1.5 text-xs font-bold shadow-[2px_2px_0px_var(--forest)]"
            >
              <Printer className="w-4 h-4 text-[var(--forest)]" />
              <span>Cetak Struk</span>
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={() => onCallVoice(successOrder.result.queueNumber)}
              className="gap-1.5 text-xs font-bold shadow-[2px_2px_0px_var(--forest)]"
            >
              <Volume2 className="w-4 h-4 text-[var(--leaf)]" />
              <span>Panggil Suara</span>
            </Button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onNewOrder}
            className="gap-2 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_var(--forest)] bg-[var(--leaf)] hover:bg-[#156336] text-white"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Pesanan Baru Lagi</span>
          </Button>

          <Link href="/dashboard/kasir" className="w-full text-center">
            <button
              type="button"
              className="text-xs text-zinc-500 hover:text-zinc-800 underline font-medium cursor-pointer py-1"
            >
              Lihat di Layar Antrian Kasir
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
