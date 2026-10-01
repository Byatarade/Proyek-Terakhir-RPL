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
      {/* 1. Mobile & Desktop Sticky Floating Bottom Bar */}
      <div
        className={cn(
          "fixed bottom-4 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none",
          className
        )}
      >
        <div className="w-full max-w-[520px] bg-zinc-950 text-white p-3 sm:p-3.5 rounded-2xl shadow-elevated border border-zinc-800 flex items-center justify-between pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 pl-1.5">
            <div className="relative w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[var(--leaf)] shrink-0">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--leaf)] text-white text-[11px] font-bold flex items-center justify-center border-2 border-zinc-950">
                {totalItems}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                Total Pesanan
              </span>
              <span className="font-heading font-bold text-base sm:text-lg text-white tabular-nums leading-none">
                {formatRupiah(totalPrice)}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsOpen(true)}
            className="gap-2 text-xs sm:text-sm font-semibold rounded-xl px-4 sm:px-5"
          >
            <span>Lihat Pesanan</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 2. Receipt Modal / Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isSubmitting && setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Receipt Card Container */}
          <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl shadow-elevated border border-zinc-200/90 overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200">
            {/* Header: Nota Style */}
            <div className="p-5 sm:p-6 border-b border-dashed border-zinc-200 flex items-center justify-between shrink-0 bg-zinc-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 text-[var(--leaf)] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-base sm:text-lg text-zinc-950 leading-none">
                    Pesanan Kamu
                  </h2>
                  <span className="text-[11px] text-zinc-500 font-medium mt-0.5 block">
                    {totalItems} item dipilih
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onClearCart}
                  disabled={isSubmitting}
                  className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Kosongkan keranjang"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                  aria-label="Tutup keranjang"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Order Items List */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="space-y-3.5">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-2xl bg-zinc-50/80 border border-zinc-200/70 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-zinc-900 leading-snug">
                          {item.product.name}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono mt-0.5">
                          {formatRupiah(item.product.price_sell)} / porsi
                        </span>
                      </div>
                      <span className="font-heading font-bold text-sm text-zinc-950 tabular-nums">
                        {formatRupiah(item.product.price_sell * item.qty)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60">
                      <span className="text-xs text-zinc-500 font-medium">Jumlah</span>
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

              {/* Physical Receipt Dot Leader Summary */}
              <div className="pt-4 border-t border-dashed border-zinc-300 space-y-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                  Rincian Pembayaran
                </span>
                <DotLeader
                  name="Subtotal"
                  price={totalPrice}
                  className="text-xs text-zinc-600"
                />
                <DotLeader
                  name="Biaya Layanan"
                  price={0}
                  className="text-xs text-zinc-600"
                />

                <div className="pt-2 flex items-baseline justify-between border-t border-zinc-200">
                  <span className="font-heading font-bold text-base text-zinc-950">
                    Total Bayar
                  </span>
                  <span className="font-heading font-bold text-xl text-[var(--leaf)] tabular-nums">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-4 border-t border-dashed border-zinc-300 space-y-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                  Metode Pembayaran
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {acceptQris && (
                    <label
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all select-none",
                        paymentMethod === "qris"
                          ? "bg-emerald-50/70 border-[var(--leaf)] text-zinc-950 ring-1 ring-[var(--leaf)]"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
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
                          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                          paymentMethod === "qris"
                            ? "bg-[var(--leaf)] text-white"
                            : "bg-zinc-100 text-zinc-500"
                        )}
                      >
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight">
                          QRIS (Instan)
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Scan e-wallet / m-banking
                        </span>
                      </div>
                    </label>
                  )}

                  {acceptCash && (
                    <label
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all select-none",
                        paymentMethod === "cash"
                          ? "bg-emerald-50/70 border-[var(--leaf)] text-zinc-950 ring-1 ring-[var(--leaf)]"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
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
                          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                          paymentMethod === "cash"
                            ? "bg-[var(--leaf)] text-white"
                            : "bg-zinc-100 text-zinc-500"
                        )}
                      >
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight">
                          Tunai di Kasir
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Bayar langsung ke kasir
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Modal Footer CTA */}
            <div className="p-4 sm:p-5 border-t border-zinc-200 bg-zinc-50 shrink-0">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting || items.length === 0}
                className="w-full gap-2 text-sm sm:text-base font-bold shadow-md rounded-2xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <>
                    <span>Pesan Sekarang ({formatRupiah(totalPrice)})</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
