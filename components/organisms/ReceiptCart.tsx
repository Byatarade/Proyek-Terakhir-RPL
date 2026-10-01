"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  X,
  CreditCard,
  Banknote,
  ArrowRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { ProductItem } from "@/components/molecules/ProductCard";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { Button } from "@/components/atoms/Button";
import { DotLeader } from "@/components/molecules/DotLeader";

export interface CartItem {
  product: ProductItem;
  qty: number;
}

export interface ReceiptCartProps {
  items: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onClearCart: () => void;
  acceptCash?: boolean;
  acceptQris?: boolean;
  onSubmitOrder: (paymentMethod: "cash" | "qris") => Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

export function ReceiptCart({
  items,
  onUpdateQty,
  onClearCart,
  acceptCash = true,
  acceptQris = true,
  onSubmitOrder,
  isSubmitting = false,
  className,
}: ReceiptCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">(
    acceptQris ? "qris" : "cash"
  );

  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.product.price_sell * item.qty,
    0
  );

  if (items.length === 0) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitOrder(paymentMethod);
  };

  return (
    <>
      {/* 1. Mobile & Desktop Sticky Floating Bottom Bar (design.md 9.3) */}
      <div
        className={cn(
          "fixed bottom-4 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none",
          className
        )}
      >
        <div className="w-full max-w-[520px] bg-[var(--forest)] text-white p-3 sm:p-3.5 rounded-[8px] border-2 border-[var(--forest)] shadow-[4px_4px_0px_rgba(15,61,42,0.6)] flex items-center justify-between pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 pl-1">
            <div className="relative w-10 h-10 rounded-[6px] bg-[var(--forest-2)] border-2 border-[var(--mint)] flex items-center justify-center text-[var(--mint)] shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-[4px] bg-[var(--mint)] text-[var(--forest)] text-[10px] font-bold border-2 border-[var(--forest)] leading-none shadow-xs">
                {totalItems}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[var(--mint)] font-semibold uppercase tracking-wider">
                Total Pesanan
              </span>
              <span className="font-heading font-bold text-base sm:text-lg text-white tabular-nums leading-tight">
                {formatRupiah(totalPrice)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[6px] bg-[var(--leaf)] hover:bg-[var(--leaf-hover)] text-white border-2 border-white/60 shadow-[2px_2px_0px_#0A291C] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs sm:text-sm font-semibold cursor-pointer select-none transition-all"
          >
            <span>Lihat Pesanan</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. Receipt Modal / Bottom Sheet (design.md 9.3 & 6.1) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop: ink solid 60% tanpa blur per design.md 5.5 */}
          <div
            className="fixed inset-0 bg-[#12201A]/60 transition-opacity"
            onClick={() => !isSubmitting && setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Receipt Card Container */}
          <div className="relative w-full max-w-[480px] bg-white rounded-t-[12px] sm:rounded-[8px] shadow-[6px_6px_0px_var(--forest)] border-2 border-[var(--forest)] overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200">
            {/* Header: Nota Style */}
            <div className="p-4 sm:p-5 border-b-2 border-dashed border-[var(--forest)] flex items-center justify-between shrink-0 bg-[var(--surface-2)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] bg-[var(--forest)] text-[var(--mint)] border-2 border-[var(--forest)] flex items-center justify-center shadow-[1px_1px_0px_var(--forest)]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-base text-[var(--forest)] leading-none">
                    Pesanan Kamu
                  </h2>
                  <span className="text-[11px] text-[var(--muted)] font-medium mt-0.5 block">
                    {totalItems} item dipilih
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onClearCart}
                  disabled={isSubmitting}
                  className="p-1.5 rounded-[6px] text-[var(--forest)] hover:bg-red-50 hover:text-[var(--danger)] border-2 border-transparent hover:border-[var(--danger)] transition-all cursor-pointer"
                  title="Kosongkan keranjang"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="p-1.5 rounded-[6px] text-[var(--forest)] hover:bg-[var(--disabled-bg)] border-2 border-[var(--forest)] shadow-[1px_1px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  aria-label="Tutup keranjang"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Scrollable Order Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[var(--bg)]">
              <div className="space-y-2.5">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-[8px] bg-white border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-[var(--forest)] leading-snug">
                          {item.product.name}
                        </span>
                        <span className="text-xs text-[var(--muted)] font-mono mt-0.5">
                          {formatRupiah(item.product.price_sell)} / porsi
                        </span>
                      </div>
                      <span className="font-heading font-bold text-sm text-[var(--forest)] tabular-nums">
                        {formatRupiah(item.product.price_sell * item.qty)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t-2 border-dashed border-[var(--line)]">
                      <span className="text-xs text-[var(--muted)] font-medium">Jumlah</span>
                      <QuantityStepper
                        value={item.qty}
                        onChange={(newQty) =>
                          onUpdateQty(item.product.id, newQty)
                        }
                        size="sm"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Physical Receipt Dot Leader Summary (design.md 6.2) */}
              <div className="pt-4 border-t-2 border-dashed border-[var(--forest)] space-y-2 bg-white p-3.5 rounded-[8px] border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] block border-b-2 border-[var(--forest)] pb-1">
                  Rincian Pembayaran
                </span>
                <DotLeader
                  name="Subtotal"
                  price={totalPrice}
                  className="text-xs text-[var(--forest)] font-medium"
                />
                <DotLeader
                  name="Biaya Layanan"
                  price={0}
                  className="text-xs text-[var(--forest)] font-medium"
                />

                <div className="pt-2 flex items-baseline justify-between border-t-2 border-dashed border-[var(--forest)] mt-2">
                  <span className="font-heading font-bold text-base text-[var(--forest)]">
                    Total Bayar
                  </span>
                  <span className="font-heading font-bold text-xl text-[var(--leaf)] tabular-nums">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-2 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] block">
                  Pilih Metode Pembayaran
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {acceptQris && (
                    <label
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-[8px] border-2 cursor-pointer transition-all select-none",
                        paymentMethod === "qris"
                          ? "bg-[var(--surface-2)] border-[var(--forest)] text-[var(--forest)] shadow-[3px_3px_0px_var(--forest)]"
                          : "bg-white border-[var(--line)] text-[var(--muted)] hover:border-[var(--forest)]"
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="qris"
                        checked={paymentMethod === "qris"}
                        onChange={() => setPaymentMethod("qris")}
                        className="sr-only"
                        disabled={isSubmitting}
                      />
                      <div
                        className={cn(
                          "w-8 h-8 rounded-[6px] border-2 border-[var(--forest)] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_var(--forest)]",
                          paymentMethod === "qris"
                            ? "bg-[var(--leaf)] text-white"
                            : "bg-white text-[var(--forest)]"
                        )}
                      >
                        <CreditCard className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight text-[var(--forest)]">
                          QRIS (Instan)
                        </span>
                        <span className="text-[10px] text-[var(--muted)]">
                          Scan e-wallet / m-banking
                        </span>
                      </div>
                    </label>
                  )}

                  {acceptCash && (
                    <label
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-[8px] border-2 cursor-pointer transition-all select-none",
                        paymentMethod === "cash"
                          ? "bg-[var(--surface-2)] border-[var(--forest)] text-[var(--forest)] shadow-[3px_3px_0px_var(--forest)]"
                          : "bg-white border-[var(--line)] text-[var(--muted)] hover:border-[var(--forest)]"
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={() => setPaymentMethod("cash")}
                        className="sr-only"
                        disabled={isSubmitting}
                      />
                      <div
                        className={cn(
                          "w-8 h-8 rounded-[6px] border-2 border-[var(--forest)] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_var(--forest)]",
                          paymentMethod === "cash"
                            ? "bg-[var(--leaf)] text-white"
                            : "bg-white text-[var(--forest)]"
                        )}
                      >
                        <Banknote className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight text-[var(--forest)]">
                          Tunai di Kasir
                        </span>
                        <span className="text-[10px] text-[var(--muted)]">
                          Bayar saat ambil pesanan
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Action Submit Button */}
            <div className="p-4 sm:p-5 border-t-2 border-[var(--forest)] bg-white">
              <form onSubmit={handleSubmit}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full gap-2 text-sm sm:text-base font-bold h-12 shadow-[3px_3px_0px_var(--forest)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Mengirim Pesanan...</span>
                    </>
                  ) : (
                    <>
                      <span>Pesan Sekarang ({formatRupiah(totalPrice)})</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
