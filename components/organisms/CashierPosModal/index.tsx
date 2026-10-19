"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import { ShoppingBag, X } from "lucide-react";
import QRCode from "qrcode";
import { toDynamicQris } from "@/lib/payments/qris";
import {
  CashierProductItem,
  createCashierWalkinOrderAction,
  CashierOrder,
} from "@/lib/cashier/actions";

import {
  CashierPosModalProps,
  CartItem,
  CreatedOrderResultState,
} from "./types";
import { PosMenuSection } from "./PosMenuSection";
import { PosCartSection } from "./PosCartSection";
import { PosSuccessOverlay } from "./PosSuccessOverlay";
import { PosLargeQrOverlay } from "./PosLargeQrOverlay";

export type { CashierPosModalProps } from "./types";

export function CashierPosModal({
  isOpen,
  onClose,
  catalog,
  storeName,
  onOrderCreated,
  onPrintReceipt,
  onCallQueueVoice,
}: CashierPosModalProps) {
  // POS Cart State
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [cashReceivedInput, setCashReceivedInput] = useState<string>("");
  const [orderNote, setOrderNote] = useState<string>("");

  // QRIS State
  const qrisConfig = catalog.storeQris;
  const [qrisDataUrl, setQrisDataUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const [showLargeQrModal, setShowLargeQrModal] = useState<boolean>(false);

  // Submission State
  const [isSubmitting, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdOrderResult, setCreatedOrderResult] =
    useState<CreatedOrderResultState | null>(null);

  // Cart calculations
  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(
    () => cartItems.reduce((acc, it) => acc + it.qty, 0),
    [cartItems]
  );
  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (acc, it) => acc + it.product.priceSell * it.qty,
        0
      ),
    [cartItems]
  );

  // Cash and change calculations
  const parsedCashReceived = Number(cashReceivedInput.replace(/\D/g, "")) || 0;
  const changeAmount = parsedCashReceived - subtotal;
  const isCashInsufficient =
    paymentMethod === "cash" && (parsedCashReceived < subtotal || subtotal === 0);

  // Generate Dynamic QRIS jika metode pembayaran QRIS dipilih
  useEffect(() => {
    let isCancelled = false;

    async function generateQrisImage() {
      if (paymentMethod !== "qris" || !qrisConfig?.qrisPayload) {
        setQrisDataUrl(null);
        return;
      }

      setIsGeneratingQr(true);
      try {
        let finalPayload = qrisConfig.qrisPayload;
        if (subtotal > 0) {
          try {
            finalPayload = toDynamicQris(qrisConfig.qrisPayload, subtotal);
          } catch (err) {
            console.warn("Gagal konversi ke dynamic QRIS:", err);
            finalPayload = qrisConfig.qrisPayload;
          }
        }

        const url = await QRCode.toDataURL(finalPayload, {
          width: 320,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        if (!isCancelled) {
          setQrisDataUrl(url);
        }
      } catch (err) {
        console.error("Gagal membuat QRIS:", err);
      } finally {
        if (!isCancelled) {
          setIsGeneratingQr(false);
        }
      }
    }

    generateQrisImage();

    return () => {
      isCancelled = true;
    };
  }, [paymentMethod, subtotal, qrisConfig?.qrisPayload]);

  // Cart operations
  const handleAddToCart = (product: CashierProductItem) => {
    if (!product.isAvailable) return;
    setCart((prev) => {
      const existing = prev[product.id];
      const newQty = (existing?.qty || 0) + 1;
      return {
        ...prev,
        [product.id]: {
          product,
          qty: newQty,
        },
      };
    });
  };

  const handleUpdateQty = (productId: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      if (!prev[productId]) return prev;
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          qty,
        },
      };
    });
  };

  const handleClearCart = () => {
    setCart({});
    setCashReceivedInput("");
    setOrderNote("");
    setSubmitError(null);
  };

  // Quick Cash Denominations
  const quickCashOptions = useMemo(() => {
    if (subtotal <= 0) return [10000, 20000, 50000, 100000];
    const baseOptions = [10000, 20000, 50000, 100000];
    const next5k = Math.ceil(subtotal / 5000) * 5000;
    const next10k = Math.ceil(subtotal / 10000) * 10000;
    const next50k = Math.ceil(subtotal / 50000) * 50000;
    const set = new Set([subtotal, next5k, next10k, next50k, ...baseOptions]);
    return Array.from(set)
      .filter((n) => n >= subtotal)
      .sort((a, b) => a - b)
      .slice(0, 5);
  }, [subtotal]);

  // Handle Checkout Submission
  const handleSubmitOrder = () => {
    if (cartItems.length === 0) {
      setSubmitError("Pilih minimal 1 menu sebelum memproses pesanan.");
      return;
    }
    if (paymentMethod === "cash" && isCashInsufficient) {
      setSubmitError(
        "Uang tunai yang diterima masih kurang dari total belanja."
      );
      return;
    }

    setSubmitError(null);
    startTransition(async () => {
      const itemsPayload = cartItems.map((ci) => ({
        productId: ci.product.id,
        qty: ci.qty,
      }));

      const res = await createCashierWalkinOrderAction({
        items: itemsPayload,
        paymentMethod,
        cashReceived: paymentMethod === "cash" ? parsedCashReceived : undefined,
        note: orderNote.trim() || undefined,
      });

      if (!res.success || !res.data) {
        setSubmitError(res.error || "Gagal membuat pesanan kasir.");
        return;
      }

      // Success
      const resultData = res.data;
      const currentCartItems = [...cartItems];
      setCreatedOrderResult({
        result: resultData,
        items: currentCartItems,
      });

      // Notify parent component
      onOrderCreated(resultData, currentCartItems);

      // Auto call voice chime if enabled
      if (onCallQueueVoice) {
        onCallQueueVoice(resultData.queueNumber);
      }
    });
  };

  const handleStartNewOrder = () => {
    setCart({});
    setCashReceivedInput("");
    setOrderNote("");
    setSubmitError(null);
    setCreatedOrderResult(null);
  };

  const handlePrintCreatedReceipt = () => {
    if (!createdOrderResult) return;
    if (onPrintReceipt) {
      const fakeOrder: CashierOrder = {
        id: createdOrderResult.result.orderId,
        storeId: "",
        queueDate: new Date().toISOString().split("T")[0],
        queueNumber: createdOrderResult.result.queueNumber,
        status: "dibayar",
        total: createdOrderResult.result.total,
        paymentMethod: paymentMethod,
        paidConfirmedBy: "cashier",
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cancelReason: null,
        publicToken: createdOrderResult.result.publicToken,
        items: createdOrderResult.items.map((it, idx) => ({
          id: `${createdOrderResult.result.orderId}-${idx}`,
          productId: it.product.id,
          name: it.product.name,
          qty: it.qty,
          price: it.product.priceSell,
        })),
      };
      onPrintReceipt(fakeOrder);
    } else {
      window.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs no-print">
      <div className="w-full max-w-6xl max-h-[96vh] flex flex-col bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b-2 border-[var(--forest)] bg-[var(--surface-2)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--forest)] text-white flex items-center justify-center font-heading font-extrabold shadow-[2px_2px_0px_var(--forest)]">
              <ShoppingBag className="w-5 h-5 text-[var(--mint)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-zinc-950 tracking-tight leading-tight">
                  Input Pesanan Baru (Kasir Walk-In)
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[var(--leaf)] text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                  POS UMKM
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                {storeName} • Pesanan langsung dicatat, lunas, & diteruskan ke
                antrian dapur
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 border border-transparent hover:border-zinc-300 transition-colors cursor-pointer"
            aria-label="Tutup Layar Kasir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {createdOrderResult ? (
          /* ================= SUCCESS TICKET VIEW ================= */
          <PosSuccessOverlay
            createdOrderResult={createdOrderResult}
            storeName={storeName}
            paymentMethod={paymentMethod}
            parsedCashReceived={parsedCashReceived}
            onPrintReceipt={handlePrintCreatedReceipt}
            onCallQueueVoice={
              onCallQueueVoice
                ? () =>
                    onCallQueueVoice(createdOrderResult.result.queueNumber)
                : undefined
            }
            onStartNewOrder={handleStartNewOrder}
            onClose={onClose}
          />
        ) : (
          /* ================= POS DUAL PANE VIEW ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
            {/* LEFT PANEL: Menu Catalog & Categories (7 cols) */}
            <PosMenuSection
              catalog={catalog}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              cart={cart}
              onAddToCart={handleAddToCart}
            />

            {/* RIGHT PANEL: Order Cart & Cash Checkout (5 cols) */}
            <PosCartSection
              cartItems={cartItems}
              cartCount={cartCount}
              subtotal={subtotal}
              onClearCart={handleClearCart}
              onUpdateQty={handleUpdateQty}
              orderNote={orderNote}
              onOrderNoteChange={setOrderNote}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              parsedCashReceived={parsedCashReceived}
              onCashReceivedChange={setCashReceivedInput}
              changeAmount={changeAmount}
              isCashInsufficient={isCashInsufficient}
              quickCashOptions={quickCashOptions}
              qrisConfig={qrisConfig}
              storeName={storeName}
              isGeneratingQr={isGeneratingQr}
              qrisDataUrl={qrisDataUrl}
              onShowLargeQr={() => setShowLargeQrModal(true)}
              submitError={submitError}
              isSubmitting={isSubmitting}
              onSubmitOrder={handleSubmitOrder}
            />
          </div>
        )}
      </div>

      {/* Modal Tampilan Penuh QRIS untuk Pelanggan */}
      <PosLargeQrOverlay
        isOpen={showLargeQrModal}
        onClose={() => setShowLargeQrModal(false)}
        qrisDataUrl={qrisDataUrl}
        storeName={storeName}
        merchantName={qrisConfig?.qrisMerchantName || null}
        subtotal={subtotal}
      />
    </div>
  );
}
