import React from "react";
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { formatRupiah } from "@/lib/utils";
import { DeleteProductModalProps } from "./types";

export function DeleteProductModal({
  isOpen,
  onClose,
  product,
  isPending,
  onConfirm,
}: DeleteProductModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isPending && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-elevated border border-zinc-200 overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          {/* Header with Danger Badge and Close Button */}
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <Trash2 className="w-6 h-6 stroke-[2]" />
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Heading & Subtitle */}
          <div className="mt-4 space-y-1">
            <h3 className="font-heading font-bold text-xl text-zinc-950 tracking-tight">
              Hapus Produk Menu?
            </h3>
            <p className="text-xs text-zinc-500">
              Tindakan ini permanen dan produk akan dihapus dari seluruh katalog toko.
            </p>
          </div>

          {/* Product Detail Card */}
          <div className="mt-4 p-3.5 rounded-2xl bg-zinc-50/90 border border-zinc-200/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm text-zinc-950 truncate">
                {product.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-200/70 text-zinc-700 text-[11px] font-medium shrink-0">
                {product.category_name || "Tanpa Kategori"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200/60 text-zinc-500">
              <span>Harga Jual</span>
              <span className="font-heading font-semibold text-zinc-950 tabular-nums">
                {formatRupiah(product.price_sell)}
              </span>
            </div>

            {product.description && (
              <p className="text-[11px] text-zinc-500 line-clamp-2 italic pt-0.5">
                &ldquo;{product.description}&rdquo;
              </p>
            )}
          </div>

          {/* Warning Message Box */}
          <div className="mt-3.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-amber-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Produk akan dihapus permanen dari menu pelanggan dan kasir POS. Riwayat transaksi sebelumnya tetap aman tersimpan.
            </span>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl text-xs font-semibold px-4"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={onConfirm}
              disabled={isPending}
              className="gap-2 rounded-xl text-xs font-semibold px-5"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Produk</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
