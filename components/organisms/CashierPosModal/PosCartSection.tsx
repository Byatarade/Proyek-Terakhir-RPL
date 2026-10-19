import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Banknote,
  QrCode,
  Loader2,
  Maximize2,
  AlertTriangle,
  Settings,
  AlertCircle,
  Check,
} from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { CartItem } from "./types";

interface PosCartSectionProps {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  onClearCart: () => void;
  onUpdateQty: (productId: string, qty: number) => void;
  orderNote: string;
  onOrderNoteChange: (note: string) => void;
  paymentMethod: "cash" | "qris";
  onPaymentMethodChange: (method: "cash" | "qris") => void;
  parsedCashReceived: number;
  onCashReceivedChange: (val: string) => void;
  changeAmount: number;
  isCashInsufficient: boolean;
  quickCashOptions: number[];
  qrisConfig?: {
    acceptQris: boolean;
    qrisMerchantName: string | null;
    qrisPayload: string | null;
  };
  storeName: string;
  isGeneratingQr: boolean;
  qrisDataUrl: string | null;
  onShowLargeQr: () => void;
  submitError: string | null;
  isSubmitting: boolean;
  onSubmitOrder: () => void;
}

export function PosCartSection({
  cartItems,
  cartCount,
  subtotal,
  onClearCart,
  onUpdateQty,
  orderNote,
  onOrderNoteChange,
  paymentMethod,
  onPaymentMethodChange,
  parsedCashReceived,
  onCashReceivedChange,
  changeAmount,
  isCashInsufficient,
  quickCashOptions,
  qrisConfig,
  storeName,
  isGeneratingQr,
  qrisDataUrl,
  onShowLargeQr,
  submitError,
  isSubmitting,
  onSubmitOrder,
}: PosCartSectionProps) {
  return (
    <div className="lg:col-span-5 flex flex-col bg-white overflow-hidden">
      {/* Cart Header */}
      <div className="p-3 sm:p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
        <div className="flex items-center gap-2">
          <span className="font-heading font-extrabold text-sm text-zinc-950">
            Rincian Pesanan
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--leaf)] text-white text-[11px] font-bold">
            {cartCount} item
          </span>
        </div>

        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
        {cartItems.length === 0 ? (
          <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center p-6 text-zinc-400">
            <ShoppingBag className="w-10 h-10 text-zinc-300 mb-2 stroke-[1.5]" />
            <p className="font-heading font-bold text-sm text-zinc-700">
              Keranjang Masih Kosong
            </p>
            <p className="text-xs text-zinc-400 max-w-[200px] mt-1">
              Pilih menu di panel sebelah kiri untuk menambahkan pesanan
              pelanggan.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {cartItems.map((ci) => (
              <div
                key={ci.product.id}
                className="p-2.5 rounded-xl border border-zinc-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-bold text-xs sm:text-sm text-zinc-950 truncate">
                    {ci.product.name}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    {formatRupiah(ci.product.priceSell)} / porsi
                  </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2 shrink-0">
                  <QuantityStepper
                    value={ci.qty}
                    onChange={(val) => onUpdateQty(ci.product.id, val)}
                    min={0}
                    max={99}
                    size="sm"
                  />
                  <div className="w-16 text-right font-mono font-bold text-xs text-zinc-950">
                    {formatRupiah(ci.product.priceSell * ci.qty)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Controls Area */}
      <div className="p-3 sm:p-4 border-t-2 border-[var(--forest)] bg-zinc-50/80 space-y-3">
        {/* Optional Note */}
        <input
          type="text"
          placeholder="Catatan pesanan (Cth: Meja 02 / Dibungkus)"
          value={orderNote}
          onChange={(e) => onOrderNoteChange(e.target.value)}
          className="w-full h-8 px-3 rounded-lg border border-zinc-300 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[var(--forest)]"
        />

        {/* Subtotal & Total */}
        <div className="flex items-center justify-between border-b border-dashed border-zinc-300 pb-2">
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
            Total Tagihan
          </span>
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-[var(--forest)]">
            {formatRupiah(subtotal)}
          </span>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
            Metode Pembayaran Kasir:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onPaymentMethodChange("cash")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded-xl border-2 text-xs font-heading font-extrabold transition-all cursor-pointer",
                paymentMethod === "cash"
                  ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                  : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400"
              )}
            >
              <Banknote className="w-4 h-4 text-[var(--mint)]" />
              <span>Tunai (Cash)</span>
            </button>

            <button
              type="button"
              onClick={() => onPaymentMethodChange("qris")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded-xl border-2 text-xs font-heading font-extrabold transition-all cursor-pointer",
                paymentMethod === "qris"
                  ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                  : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400"
              )}
            >
              <QrCode className="w-4 h-4 text-[var(--mint)]" />
              <span>QRIS Kasir</span>
            </button>
          </div>
        </div>

        {/* Cash Calculation UI (Only if Cash selected) */}
        {paymentMethod === "cash" && (
          <div className="p-2.5 rounded-xl bg-white border border-zinc-300 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700">
                Uang Tunai Diterima:
              </span>
              <div className="relative w-36">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-bold">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={
                    parsedCashReceived > 0
                      ? new Intl.NumberFormat("id-ID").format(parsedCashReceived)
                      : ""
                  }
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    onCashReceivedChange(raw);
                  }}
                  className="w-full h-8 pl-8 pr-2 rounded-lg border border-zinc-300 text-xs font-mono font-bold text-right text-zinc-950 focus:outline-none focus:ring-1 focus:ring-[var(--leaf)]"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => onCashReceivedChange(String(subtotal))}
                className="px-2 py-1 rounded bg-[var(--surface-2)] text-[var(--forest)] border border-[var(--forest)] text-[10px] font-bold hover:bg-[var(--forest)] hover:text-white transition-colors cursor-pointer"
              >
                Uang Pas
              </button>
              {quickCashOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onCashReceivedChange(String(opt))}
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer",
                    parsedCashReceived === opt
                      ? "bg-[var(--leaf)] text-white border-[var(--leaf)]"
                      : "bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200"
                  )}
                >
                  {formatRupiah(opt)}
                </button>
              ))}
            </div>

            {/* Change / Kembalian Display */}
            {subtotal > 0 && parsedCashReceived > 0 && (
              <div
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg text-xs font-bold font-mono transition-colors",
                  changeAmount >= 0
                    ? "bg-[var(--surface-2)] text-[var(--leaf)] border border-[var(--forest)]"
                    : "bg-red-50 text-red-700 border border-red-200"
                )}
              >
                <span>{changeAmount >= 0 ? "KEMBALIAN:" : "KURANG:"}</span>
                <span className="text-sm font-extrabold">
                  {formatRupiah(Math.abs(changeAmount))}
                </span>
              </div>
            )}
          </div>
        )}

        {/* QRIS Presentation UI */}
        {paymentMethod === "qris" && (
          <div className="p-3 rounded-xl bg-white border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header QRIS */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--leaf)] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--leaf)]">
                  {subtotal > 0
                    ? "QRIS Dinamis (Nominal Terisi)"
                    : "QRIS Toko"}
                </span>
              </div>
              <span className="font-heading font-extrabold text-[11px] text-zinc-950 uppercase tracking-wider truncate max-w-[150px]">
                {qrisConfig?.qrisMerchantName || storeName}
              </span>
            </div>

            {qrisConfig?.qrisPayload ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                {/* QR Code Container */}
                <div className="p-2.5 bg-white rounded-xl border border-[var(--forest)] shadow-xs flex flex-col items-center">
                  {isGeneratingQr ? (
                    <div className="w-36 h-36 flex flex-col items-center justify-center bg-zinc-50 rounded-lg">
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--leaf)]" />
                      <span className="text-[10px] text-zinc-500 mt-1 font-medium">
                        Membuat QRIS...
                      </span>
                    </div>
                  ) : qrisDataUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrisDataUrl}
                        alt={`QRIS ${storeName}`}
                        className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                      />
                      <div className="text-[9px] font-mono text-zinc-500 font-semibold mt-0.5">
                        Standar QRIS Bank Indonesia (ASPI)
                      </div>
                    </>
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center bg-zinc-50 text-[10px] text-zinc-400">
                      Gagal memuat QRIS
                    </div>
                  )}
                </div>

                {/* Tombol Perbesar QR untuk Pelanggan */}
                {qrisDataUrl && (
                  <button
                    type="button"
                    onClick={onShowLargeQr}
                    className="text-[11px] text-[var(--forest)] hover:text-[var(--leaf)] font-bold underline flex items-center gap-1 cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Perbesar Tampilan QR untuk Pelanggan</span>
                  </button>
                )}

                {/* Rincian Petunjuk Bayar */}
                <div className="w-full p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--forest)] space-y-0.5 text-left text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-700">
                      Nominal Transfer:
                    </span>
                    <span className="font-heading font-extrabold text-xs text-[var(--forest)]">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-600 leading-tight">
                    Tunjukkan QR ini ke pembeli. Scan menggunakan GoPay, OVO,
                    DANA, BCA, ShopeePay, atau m-Banking.
                  </p>
                </div>
              </div>
            ) : (
              /* Warning jika toko belum atur QRIS di pengaturan */
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-500 text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-heading font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Kode QRIS Toko Belum Diatur</span>
                </div>
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  Toko <strong>{storeName}</strong> belum menyimpan kode QRIS di
                  pengaturan toko.
                </p>
                <Link
                  href="/dashboard/pengaturan"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 hover:text-black underline"
                >
                  <Settings className="w-3 h-3" />
                  <span>Atur QRIS Toko Sekarang &rarr;</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Submit Error */}
        {submitError && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Final Submit Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={onSubmitOrder}
          disabled={
            isSubmitting ||
            cartItems.length === 0 ||
            (paymentMethod === "cash" && isCashInsufficient)
          }
          className="w-full gap-2 text-sm font-bold shadow-[3px_3px_0px_var(--forest)] bg-[var(--leaf)] hover:bg-[#156336] text-white disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menerbitkan Antrian...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                Bayar & Terbitkan Antrian ({formatRupiah(subtotal)})
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
