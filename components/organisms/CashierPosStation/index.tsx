"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import Link from "next/link";
import { Receipt, ArrowRight, RotateCcw } from "lucide-react";
import QRCode from "qrcode";
import { toDynamicQris } from "@/lib/payments/qris";
import {
  CashierCatalog,
  createCashierWalkinOrderAction,
  getCashierCatalogAction,
} from "@/lib/cashier/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";

import { CashierPosStationProps, SuccessOrderState } from "./types";
import { useCart } from "./hooks/useCart";
import { callQueueVoice } from "./audio";
import { MenuPanel } from "./MenuPanel";
import { CartPanel } from "./CartPanel";
import { ReceiptSuccessModal } from "./ReceiptSuccessModal";
import { LargeQrModal } from "./LargeQrModal";

export type { CashierPosStationProps } from "./types";

export function CashierPosStation({
  initialCatalog,
  storeName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  storeSlug,
  storeQris,
}: CashierPosStationProps) {
  const [catalog, setCatalog] = useState<CashierCatalog>(initialCatalog);
  const [isRefreshingCatalog, setIsRefreshingCatalog] = useState(false);

  // QRIS Configuration & Dynamic QR Generator
  const qrisConfig = storeQris || catalog.storeQris;
  const [qrisDataUrl, setQrisDataUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const [showLargeQrModal, setShowLargeQrModal] = useState<boolean>(false);

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cart Management
  const {
    cart,
    cartItems,
    cartCount,
    subtotal,
    handleAddToCart,
    handleUpdateQty,
    handleClearCart,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [cashReceivedInput, setCashReceivedInput] = useState<string>("");
  const [orderNote, setOrderNote] = useState<string>("");

  // Submission State
  const [isSubmitting, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Success Modal State
  const [successOrder, setSuccessOrder] = useState<SuccessOrderState | null>(null);

  const handleRefreshCatalog = async () => {
    setIsRefreshingCatalog(true);
    const res = await getCashierCatalogAction();
    if (res.success && res.data) {
      setCatalog(res.data);
    }
    setIsRefreshingCatalog(false);
  };

  // Fetch catalog on mount if empty
  useEffect(() => {
    if (!initialCatalog || initialCatalog.products.length === 0) {
      setTimeout(() => {
        handleRefreshCatalog();
      }, 0);
    }
  }, [initialCatalog]);

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
        // Jika nominal belanja > 0, ubah ke Dynamic QRIS agar nominal otomatis terisi saat di-scan pelanggan
        if (subtotal > 0) {
          try {
            finalPayload = toDynamicQris(qrisConfig.qrisPayload, subtotal);
          } catch (err) {
            console.warn(
              "Gagal konversi ke dynamic QRIS, menggunakan payload asli:",
              err
            );
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

  // Submit POS Order
  const handleSubmitOrder = () => {
    if (cartItems.length === 0) {
      setSubmitError("Pilih minimal 1 menu sebelum memproses pembayaran.");
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

      const resultData = res.data;
      const currentCartItems = [...cartItems];

      setSuccessOrder({
        result: resultData,
        items: currentCartItems,
        paidMethod: paymentMethod,
        cashReceived: parsedCashReceived,
        changeAmount: resultData.changeAmount,
        createdAt: new Date().toISOString(),
      });

      // Call voice chime
      callQueueVoice(resultData.queueNumber);

      // Reset active cart
      handleClearCart();
      setCashReceivedInput("");
      setOrderNote("");
    });
  };

  const handleNewOrder = () => {
    setSuccessOrder(null);
    handleClearCart();
    setCashReceivedInput("");
    setOrderNote("");
    setSubmitError(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman Kasir POS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--leaf)] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--leaf)]">
              Kasir Biasa (Point of Sale)
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-950 tracking-tight mt-1">
            Mesin Kasir (POS)
          </h1>
          <p className="text-sm text-zinc-500 font-normal">
            Layanan pesan langsung di meja kasir. Pilih menu pesanan pelanggan,
            terima uang tunai/QRIS, dan terbitkan nomor antrian.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Tautan ke Layar Kasir PRD */}
          <Link href="/dashboard/kasir">
            <Button
              variant="secondary"
              size="md"
              className="gap-2 text-xs sm:text-sm font-semibold border-zinc-300"
            >
              <Receipt className="w-4 h-4 text-[var(--forest)]" />
              <span>Buka Layar Antrian Kasir</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Button>
          </Link>

          {/* Tombol Refresh Katalog */}
          <Button
            variant="secondary"
            size="md"
            onClick={handleRefreshCatalog}
            disabled={isRefreshingCatalog}
            className="gap-2 text-xs sm:text-sm font-semibold"
          >
            <RotateCcw
              className={cn(
                "w-4 h-4",
                isRefreshingCatalog && "animate-spin text-[var(--leaf)]"
              )}
            />
            <span>Segarkan Menu</span>
          </Button>
        </div>
      </div>

      {/* 2. Workspace POS Dual Pane (Full View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Katalog Menu & Kategori (7 Kolom) */}
        <MenuPanel
          catalog={catalog}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cart={cart}
          onAddToCart={handleAddToCart}
        />

        {/* RIGHT COLUMN: Rincian Nota & Kalkulator Kasir (5 Kolom) */}
        <CartPanel
          cartItems={cartItems}
          cartCount={cartCount}
          subtotal={subtotal}
          onUpdateQty={handleUpdateQty}
          onClearCart={handleClearCart}
          orderNote={orderNote}
          onOrderNoteChange={setOrderNote}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          onCashReceivedChange={setCashReceivedInput}
          parsedCashReceived={parsedCashReceived}
          changeAmount={changeAmount}
          isCashInsufficient={isCashInsufficient}
          quickCashOptions={quickCashOptions}
          qrisConfig={qrisConfig}
          storeName={storeName}
          qrisDataUrl={qrisDataUrl}
          isGeneratingQr={isGeneratingQr}
          onShowLargeQr={() => setShowLargeQrModal(true)}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onSubmitOrder={handleSubmitOrder}
        />
      </div>

      {/* 3. Modal Sukses Transaksi Kasir POS (Struk & Nomor Antrian) */}
      <ReceiptSuccessModal
        successOrder={successOrder}
        storeName={storeName}
        onNewOrder={handleNewOrder}
        onCallVoice={callQueueVoice}
      />

      {/* 4. Modal Tampilan Penuh QRIS untuk Pelanggan */}
      <LargeQrModal
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
