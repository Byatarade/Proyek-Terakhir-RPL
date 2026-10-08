"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  Minus,
  Trash2,
  X,
  Check,
  Banknote,
  QrCode,
  ShoppingBag,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  ArrowLeft,
  Printer,
  Volume2,
  Utensils,
  Cake,
  Coffee,
  IceCream,
  Cookie,
  Loader2,
  AlertCircle,
  Maximize2,
  AlertTriangle,
  Settings,
} from "lucide-react";
import QRCode from "qrcode";
import { toDynamicQris } from "@/lib/payments/qris";
import {
  CashierCatalog,
  CashierProductItem,
  createCashierWalkinOrderAction,
  CreatedWalkinOrderResult,
  CashierOrder,
} from "@/lib/cashier/actions";
import { formatRupiah, cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";

interface CartItem {
  product: CashierProductItem;
  qty: number;
}

export interface CashierPosModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: CashierCatalog;
  storeName: string;
  onOrderCreated: (orderResult: CreatedWalkinOrderResult, cartItems: CartItem[]) => void;
  onPrintReceipt?: (order: CashierOrder) => void;
  onCallQueueVoice?: (queueNumber: number) => void;
}

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
  const [createdOrderResult, setCreatedOrderResult] = useState<{
    result: CreatedWalkinOrderResult;
    items: CartItem[];
  } | null>(null);

  // Fallback icon based on keywords
  const getFallbackIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("cake") || lower.includes("kue") || lower.includes("tart")) {
      return <Cake className="w-5 h-5 text-[var(--forest)]" />;
    }
    if (lower.includes("kopi") || lower.includes("coffee") || lower.includes("teh") || lower.includes("tea")) {
      return <Coffee className="w-5 h-5 text-amber-700" />;
    }
    if (lower.includes("es") || lower.includes("ice") || lower.includes("gelato")) {
      return <IceCream className="w-5 h-5 text-blue-600" />;
    }
    if (lower.includes("roti") || lower.includes("croissant") || lower.includes("pastry") || lower.includes("cookie")) {
      return <Cookie className="w-5 h-5 text-amber-800" />;
    }
    return <Utensils className="w-5 h-5 text-[var(--forest)]" />;
  };

  // Cart calculations
  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(() => cartItems.reduce((acc, it) => acc + it.qty, 0), [cartItems]);
  const subtotal = useMemo(
    () => cartItems.reduce((acc, it) => acc + it.product.priceSell * it.qty, 0),
    [cartItems]
  );

  // Cash and change calculations
  const parsedCashReceived = Number(cashReceivedInput.replace(/\D/g, "")) || 0;
  const changeAmount = parsedCashReceived - subtotal;
  const isCashInsufficient = paymentMethod === "cash" && (parsedCashReceived < subtotal || subtotal === 0);

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

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return catalog.products.filter((p) => {
      // Category filter
      if (selectedCategory !== "all" && p.categoryId !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return p.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [catalog.products, selectedCategory, searchQuery]);

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRemoveItem = (productId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
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
    // Dynamic rounded up options
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
      setSubmitError("Uang tunai yang diterima masih kurang dari total belanja.");
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
                {storeName} • Pesanan langsung dicatat, lunas, & diteruskan ke antrian dapur
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
                    <div key={idx} className="flex justify-between text-xs font-medium">
                      <span>
                        <strong className="text-zinc-950 font-bold">{ci.qty}x</strong> {ci.product.name}
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
                  <span className="uppercase font-bold text-zinc-800">{paymentMethod}</span>
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
                onClick={handlePrintCreatedReceipt}
                className="gap-2 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_var(--forest)]"
              >
                <Printer className="w-4 h-4 text-[var(--forest)]" />
                <span>Cetak Struk Thermal</span>
              </Button>

              {onCallQueueVoice && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => onCallQueueVoice(createdOrderResult.result.queueNumber)}
                  className="gap-2 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_var(--forest)]"
                >
                  <Volume2 className="w-4 h-4 text-[var(--leaf)]" />
                  <span>Panggil Antrian</span>
                </Button>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={handleStartNewOrder}
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
        ) : (
          /* ================= POS DUAL PANE VIEW ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
            {/* LEFT PANEL: Menu Catalog & Categories (7 cols) */}
            <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r-2 border-[var(--forest)] bg-zinc-50/50 overflow-hidden">
              {/* Search & Category Header */}
              <div className="p-3 sm:p-4 border-b border-zinc-200 bg-white space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama menu / minuman..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-9 rounded-xl border-2 border-[var(--forest)] bg-white text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)] shadow-[2px_2px_0px_var(--forest)]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border-2",
                      selectedCategory === "all"
                        ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                        : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400"
                    )}
                  >
                    Semua ({catalog.products.length})
                  </button>

                  {catalog.categories.map((cat) => {
                    const count = catalog.products.filter((p) => p.categoryId === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border-2",
                          selectedCategory === cat.id
                            ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                            : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400"
                        )}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product Grid (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                {filteredProducts.length === 0 ? (
                  <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                    <Utensils className="w-10 h-10 text-zinc-300 mb-2" />
                    <p className="font-heading font-bold text-sm text-zinc-800">
                      Tidak ada menu ditemukan
                    </p>
                    <p className="text-xs text-zinc-500 max-w-xs mt-1">
                      {searchQuery
                        ? `Tidak ada produk yang cocok dengan pencarian "${searchQuery}".`
                        : "Belum ada produk terdaftar pada kategori ini."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {filteredProducts.map((product) => {
                      const inCartItem = cart[product.id];
                      const inCartQty = inCartItem?.qty || 0;
                      const isOutOfStock = !product.isAvailable;

                      return (
                        <div
                          key={product.id}
                          onClick={() => handleAddToCart(product)}
                          className={cn(
                            "relative bg-white rounded-xl border-2 transition-all p-2.5 flex flex-col justify-between cursor-pointer select-none",
                            inCartQty > 0
                              ? "border-[var(--leaf)] shadow-[3px_3px_0px_var(--forest)] ring-2 ring-[var(--leaf)]/20"
                              : "border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] hover:shadow-[3px_3px_0px_var(--forest)] hover:-translate-y-0.5",
                            isOutOfStock && "opacity-60 bg-zinc-100 cursor-not-allowed pointer-events-none"
                          )}
                        >
                          {/* Image or Fallback */}
                          <div className="relative aspect-4/3 w-full bg-[var(--surface-2)] rounded-lg flex items-center justify-center overflow-hidden border border-zinc-200 mb-2">
                            {product.imagePath ? (
                              <Image
                                src={product.imagePath}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 45vw, 200px"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-white border border-[var(--forest)] shadow-[1px_1px_0px_var(--forest)] flex items-center justify-center">
                                {getFallbackIcon(product.name)}
                              </div>
                            )}

                            {/* Badge Qty in Cart */}
                            {inCartQty > 0 && (
                              <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[var(--leaf)] text-white text-xs font-heading font-extrabold flex items-center justify-center shadow-md border border-white">
                                {inCartQty}
                              </div>
                            )}

                            {/* Out of Stock Overlay */}
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                <span className="px-2 py-0.5 rounded bg-[var(--danger)] text-white text-[10px] font-bold">
                                  HABIS
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="space-y-1">
                            <h4 className="font-heading font-bold text-xs sm:text-sm text-zinc-950 line-clamp-1 leading-snug">
                              {product.name}
                            </h4>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-[var(--leaf)]">
                                {formatRupiah(product.priceSell)}
                              </span>
                              <button
                                type="button"
                                disabled={isOutOfStock}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                className="w-6 h-6 rounded-md bg-[var(--surface-2)] hover:bg-[var(--leaf)] text-[var(--forest)] hover:text-white border border-[var(--forest)] flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: Order Cart & Cash Checkout (5 cols) */}
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
                    onClick={handleClearCart}
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
                      Pilih menu di panel sebelah kiri untuk menambahkan pesanan pelanggan.
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
                            onChange={(val) => handleUpdateQty(ci.product.id, val)}
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
                  onChange={(e) => setOrderNote(e.target.value)}
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
                      onClick={() => setPaymentMethod("cash")}
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
                      onClick={() => setPaymentMethod("qris")}
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
                      <span className="font-semibold text-zinc-700">Uang Tunai Diterima:</span>
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
                            setCashReceivedInput(raw);
                          }}
                          className="w-full h-8 pl-8 pr-2 rounded-lg border border-zinc-300 text-xs font-mono font-bold text-right text-zinc-950 focus:outline-none focus:ring-1 focus:ring-[var(--leaf)]"
                        />
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setCashReceivedInput(String(subtotal))}
                        className="px-2 py-1 rounded bg-[var(--surface-2)] text-[var(--forest)] border border-[var(--forest)] text-[10px] font-bold hover:bg-[var(--forest)] hover:text-white transition-colors cursor-pointer"
                      >
                        Uang Pas
                      </button>
                      {quickCashOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCashReceivedInput(String(opt))}
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
                          {subtotal > 0 ? "QRIS Dinamis (Nominal Terisi)" : "QRIS Toko"}
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
                            onClick={() => setShowLargeQrModal(true)}
                            className="text-[11px] text-[var(--forest)] hover:text-[var(--leaf)] font-bold underline flex items-center gap-1 cursor-pointer"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Perbesar Tampilan QR untuk Pelanggan</span>
                          </button>
                        )}

                        {/* Rincian Petunjuk Bayar */}
                        <div className="w-full p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--forest)] space-y-0.5 text-left text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-700">Nominal Transfer:</span>
                            <span className="font-heading font-extrabold text-xs text-[var(--forest)]">
                              {formatRupiah(subtotal)}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-600 leading-tight">
                            Tunjukkan QR ini ke pembeli. Scan menggunakan GoPay, OVO, DANA, BCA, ShopeePay, atau m-Banking.
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
                          Toko <strong>{storeName}</strong> belum menyimpan kode QRIS di pengaturan toko.
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
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || cartItems.length === 0 || (paymentMethod === "cash" && isCashInsufficient)}
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
                      <span>Bayar & Terbitkan Antrian ({formatRupiah(subtotal)})</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tampilan Penuh QRIS untuk Pelanggan */}
      {showLargeQrModal && qrisDataUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs no-print animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[8px_8px_0px_var(--forest)] p-6 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <span className="font-heading font-bold text-xs text-[var(--forest)] uppercase tracking-wider">
                Pindai untuk Membayar
              </span>
              <button
                type="button"
                onClick={() => setShowLargeQrModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-xl text-zinc-950">
                {qrisConfig?.qrisMerchantName || storeName}
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
              Buka aplikasi GoPay, OVO, DANA, BCA, ShopeePay, atau m-Banking Anda, lalu scan kode QRIS di atas.
            </p>

            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowLargeQrModal(false)}
              className="w-full text-xs font-bold"
            >
              Tutup Tampilan QR
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
