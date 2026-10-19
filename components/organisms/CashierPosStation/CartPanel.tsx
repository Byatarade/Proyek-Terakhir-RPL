import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Banknote,
  QrCode,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Settings,
  Maximize2,
  Check,
} from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { CartItem } from "./types";

interface CartPanelProps {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  onUpdateQty: (productId: string, qty: number) => void;
  onClearCart: () => void;
  orderNote: string;
  onOrderNoteChange: (note: string) => void;
  paymentMethod: "cash" | "qris";
  onPaymentMethodChange: (method: "cash" | "qris") => void;
  onCashReceivedChange: (val: string) => void;
  parsedCashReceived: number;
  changeAmount: number;
  isCashInsufficient: boolean;
  quickCashOptions: number[];
  qrisConfig?: {
    acceptQris: boolean;
    qrisMerchantName: string | null;
    qrisPayload: string | null;
  };
  storeName: string;
  qrisDataUrl: string | null;
  isGeneratingQr: boolean;
  onShowLargeQr: () => void;
  submitError: string | null;
  isSubmitting: boolean;
  onSubmitOrder: () => void;
}

export function CartPanel({
  cartItems,
  cartCount,
  subtotal,
  onUpdateQty,
  onClearCart,
  orderNote,
  onOrderNoteChange,
  paymentMethod,
  onPaymentMethodChange,
  onCashReceivedChange,
  parsedCashReceived,
  changeAmount,
  isCashInsufficient,
  quickCashOptions,
  qrisConfig,
  storeName,
  qrisDataUrl,
  isGeneratingQr,
  onShowLargeQr,
  submitError,
  isSubmitting,
  onSubmitOrder,
}: CartPanelProps) {
  return (
    <div className="lg:col-span-5 bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] overflow-hidden flex flex-col">
      {/* Cart Header */}
      <div className="p-4 border-b-2 border-[var(--forest)] bg-[var(--surface-2)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[var(--forest)]" />
          <span className="font-heading font-extrabold text-base text-zinc-950">
            Nota Pesanan
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--leaf)] text-white text-xs font-bold">
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
      <div className="p-4 max-h-[320px] overflow-y-auto space-y-2.5">
        {cartItems.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center p-4 text-zinc-400">
            <ShoppingBag className="w-12 h-12 text-zinc-300 mb-2 stroke-[1.5]" />
            <p className="font-heading font-bold text-sm text-zinc-700">
              Keranjang Masih Kosong
            </p>
            <p className="text-xs text-zinc-400 max-w-[220px] mt-1">
              Klik menu pada katalog di sebelah kiri untuk memasukkan pesanan pembeli.
            </p>
          </div>
        ) : (
          cartItems.map((ci) => (
            <div
              key={ci.product.id}
              className="p-3 rounded-xl border border-zinc-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
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
                <div className="w-20 text-right font-mono font-bold text-xs text-zinc-950">
                  {formatRupiah(ci.product.priceSell * ci.qty)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Checkout Controls Area */}
      <div className="p-4 border-t-2 border-[var(--forest)] bg-zinc-50/80 space-y-4">
        {/* Optional Note */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1">
            Catatan Pesanan (Opsional):
          </label>
          <input
            type="text"
            placeholder="Cth: Meja 04 / Dibungkus / Pedas sedang"
            value={orderNote}
            onChange={(e) => onOrderNoteChange(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-zinc-300 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[var(--forest)] bg-white"
          />
        </div>

        {/* Total Belanja */}
        <div className="flex items-center justify-between border-y border-dashed border-zinc-300 py-3">
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
            Total Tagihan:
          </span>
          <span className="font-heading font-extrabold text-2xl text-[var(--forest)]">
            {formatRupiah(subtotal)}
          </span>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
            Metode Pembayaran:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onPaymentMethodChange("cash")}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 text-xs font-heading font-extrabold transition-all cursor-pointer",
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
                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 text-xs font-heading font-extrabold transition-all cursor-pointer",
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

        {/* Cash Calculator UI */}
        {paymentMethod === "cash" && (
          <div className="p-3 rounded-xl bg-white border border-zinc-300 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700">
                Uang Tunai Diterima:
              </span>
              <div className="relative w-40">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-bold">
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
                  className="w-full h-8 pl-9 pr-2 rounded-lg border border-zinc-300 text-xs font-mono font-bold text-right text-zinc-950 focus:outline-none focus:ring-1 focus:ring-[var(--leaf)]"
                />
              </div>
            </div>

            {/* Quick Cash Presets */}
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

            {/* Kembalian / Kurang */}
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
          <div className="p-3.5 rounded-xl bg-white border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] space-y-3 animate-in fade-in zoom-in-95 duration-150">
            {/* Header QRIS */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--leaf)] animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--leaf)]">
                  {subtotal > 0
                    ? "QRIS Dinamis (Nominal Otomatis)"
                    : "QRIS Toko"}
                </span>
              </div>
              <span className="font-heading font-extrabold text-xs text-zinc-950 uppercase tracking-wider truncate max-w-[180px]">
                {qrisConfig?.qrisMerchantName || storeName}
              </span>
            </div>

            {qrisConfig?.qrisPayload ? (
              <div className="flex flex-col items-center justify-center space-y-2.5">
                {/* QR Code Container */}
                <div className="relative p-3 bg-white rounded-xl border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] flex flex-col items-center">
                  {isGeneratingQr ? (
                    <div className="w-48 h-48 flex flex-col items-center justify-center bg-zinc-50 rounded-lg">
                      <Loader2 className="w-7 h-7 animate-spin text-[var(--leaf)]" />
                      <span className="text-[11px] text-zinc-500 mt-2 font-medium">
                        Membuat kode QRIS...
                      </span>
                    </div>
                  ) : qrisDataUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrisDataUrl}
                        alt={`QRIS ${storeName}`}
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                      />
                      <div className="text-[10px] font-mono text-zinc-500 font-semibold mt-1">
                        Standar QRIS Bank Indonesia (ASPI)
                      </div>
                    </>
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-zinc-50 text-xs text-zinc-400">
                      Gagal memuat QRIS
                    </div>
                  )}
                </div>

                {/* Tombol Perbesar QR untuk Pelanggan */}
                {qrisDataUrl && (
                  <button
                    type="button"
                    onClick={onShowLargeQr}
                    className="text-xs text-[var(--forest)] hover:text-[var(--leaf)] font-bold underline flex items-center gap-1.5 cursor-pointer py-0.5"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Perbesar Tampilan QR untuk Pelanggan</span>
                  </button>
                )}

                {/* Rincian Petunjuk Bayar */}
                <div className="w-full p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--forest)] space-y-1 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-700">
                      Nominal Transfer:
                    </span>
                    <span className="font-heading font-extrabold text-sm text-[var(--forest)]">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-tight">
                    Tunjukkan QR ini ke pembeli. Scan menggunakan GoPay, OVO,
                    DANA, BCA, ShopeePay, atau m-Banking.
                  </p>
                </div>
              </div>
            ) : (
              /* Warning jika toko belum atur QRIS di pengaturan */
              <div className="p-3 rounded-lg bg-amber-50 border-2 border-amber-500 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-heading font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Kode QRIS Toko Belum Diatur</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Toko <strong>{storeName}</strong> belum menyimpan kode/payload
                  QRIS di pengaturan toko.
                </p>
                <Link
                  href="/dashboard/pengaturan"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-black underline"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Atur QRIS Toko Sekarang &rarr;</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Error Banner */}
        {submitError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Primary Action Button */}
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
