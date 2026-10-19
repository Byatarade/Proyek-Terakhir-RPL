import React from "react";
import { X } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";

interface LargeQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrisDataUrl: string | null;
  storeName: string;
  merchantName: string | null;
  subtotal: number;
}

export function LargeQrModal({
  isOpen,
  onClose,
  qrisDataUrl,
  storeName,
  merchantName,
  subtotal,
}: LargeQrModalProps) {
  if (!isOpen || !qrisDataUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs no-print animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[8px_8px_0px_var(--forest)] p-6 text-center space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <span className="font-heading font-bold text-xs text-[var(--forest)] uppercase tracking-wider">
            Pindai untuk Membayar
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="font-heading font-extrabold text-xl text-zinc-950">
            {merchantName || storeName}
          </h3>
          <div className="font-heading font-extrabold text-3xl text-[var(--forest)]">
            {formatRupiah(subtotal)}
          </div>
        </div>

        <div className="p-3 bg-white border-2 border-[var(--forest)] rounded-xl shadow-[3px_3px_0px_var(--forest)] inline-block mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrisDataUrl}
            alt="QRIS Pelanggan"
            className="w-64 h-64 sm:w-72 sm:h-72 object-contain mx-auto"
          />
        </div>

        <p className="text-xs text-zinc-500 font-medium leading-relaxed">
          Buka aplikasi GoPay, OVO, DANA, BCA, ShopeePay, atau m-Banking Anda,
          lalu scan kode QRIS di atas.
        </p>

        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          className="w-full text-xs font-bold"
        >
          Tutup Tampilan QR
        </Button>
      </div>
    </div>
  );
}
