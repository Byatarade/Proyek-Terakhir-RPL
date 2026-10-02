"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  Check,
  Banknote,
  QrCode,
  ShoppingBag,
  ArrowRight,
  Printer,
  Volume2,
  Utensils,
  Cake,
  Coffee,
  IceCream,
  Cookie,
  Loader2,
  AlertCircle,
  Receipt,
  RotateCcw,
  ExternalLink,
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
  getCashierCatalogAction,
} from "@/lib/cashier/actions";
import { formatRupiah, cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";

interface CartItem {
  product: CashierProductItem;
  qty: number;
}

export interface CashierPosStationProps {
  initialCatalog: CashierCatalog;
  storeName: string;
  storeSlug: string;
  storeQris?: {
    acceptQris: boolean;
    qrisMerchantName: string | null;
    qrisPayload: string | null;
  };
}

// Chime Lonceng Pemanggil Antrian 2-Nada
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(880, now + 0.22); // A5
    gain2.gain.setValueAtTime(0.28, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.85);
  } catch {
    // Ignore audio restriction
  }
}

// Suara Panggil Nomor Antrian
function callQueueVoice(queueNumber: number) {
  playChime();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const formatted = String(queueNumber).padStart(3, "0");
    const utterance = new SpeechSynthesisUtterance(
      `Nomor antrian ${formatted}, pesanan baru diterima di kasir.`
    );
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 450);
  }
}

export function CashierPosStation({
  initialCatalog,
  storeName,
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

  // Cart State
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [cashReceivedInput, setCashReceivedInput] = useState<string>("");
  const [orderNote, setOrderNote] = useState<string>("");

  // Submission State
  const [isSubmitting, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Success Modal State
  const [successOrder, setSuccessOrder] = useState<{
    result: CreatedWalkinOrderResult;
    items: CartItem[];
    paidMethod: "cash" | "qris";
    cashReceived: number;
    changeAmount: number;
    createdAt: string;
  } | null>(null);

  // Fetch catalog on mount if empty
  useEffect(() => {
    if (!initialCatalog || initialCatalog.products.length === 0) {
      handleRefreshCatalog();
    }
  }, [initialCatalog]);

  const handleRefreshCatalog = async () => {
    setIsRefreshingCatalog(true);
    const res = await getCashierCatalogAction();
    if (res.success && res.data) {
      setCatalog(res.data);
    }
    setIsRefreshingCatalog(false);
  };

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

  // Cart Calculations
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
        // Jika nominal belanja > 0, ubah ke Dynamic QRIS agar nominal otomatis terisi saat di-scan pelanggan
        if (subtotal > 0) {
          try {
            finalPayload = toDynamicQris(qrisConfig.qrisPayload, subtotal);
          } catch (err) {
            console.warn("Gagal konversi ke dynamic QRIS, menggunakan payload asli:", err);
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
      if (selectedCategory !== "all" && p.categoryId !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return p.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [catalog.products, selectedCategory, searchQuery]);

  // Cart Handlers
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

  // Submit POS Order
  const handleSubmitOrder = () => {
    if (cartItems.length === 0) {
      setSubmitError("Pilih minimal 1 menu sebelum memproses pembayaran.");
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
      setCart({});
      setCashReceivedInput("");
      setOrderNote("");
    });
  };

  const handleNewOrder = () => {
    setSuccessOrder(null);
    setCart({});
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
            Layanan pesan langsung di meja kasir. Pilih menu pesanan pelanggan, terima uang tunai/QRIS, dan terbitkan nomor antrian.
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
            <RotateCcw className={cn("w-4 h-4", isRefreshingCatalog && "animate-spin text-[var(--leaf)]")} />
            <span>Segarkan Menu</span>
          </Button>
        </div>
      </div>

      {/* 2. Workspace POS Dual Pane (Full View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Katalog Menu & Kategori (7 Kolom) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] overflow-hidden flex flex-col">
          {/* Search & Category Filter Header */}
          <div className="p-4 border-b-2 border-[var(--forest)] bg-[var(--surface-2)] space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari menu makanan atau minuman..."
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
                  "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border-2",
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
                      "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border-2",
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

          {/* Product Grid Area */}
          <div className="p-4 sm:p-5 max-h-[640px] overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <Utensils className="w-12 h-12 text-zinc-300 mb-3" />
                <p className="font-heading font-bold text-base text-zinc-800">
                  Tidak ada menu ditemukan
                </p>
                <p className="text-xs text-zinc-500 max-w-xs mt-1">
                  {searchQuery
                    ? `Tidak ada produk yang cocok dengan pencarian "${searchQuery}".`
                    : "Belum ada produk aktif pada kategori ini. Silakan kelola menu di halaman Menu & Produk."}
                </p>
                <Link href="/dashboard/menu" className="mt-4">
                  <Button variant="secondary" size="sm" className="text-xs">
                    Kelola Menu
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((product) => {
                  const inCartItem = cart[product.id];
                  const inCartQty = inCartItem?.qty || 0;
                  const isOutOfStock = !product.isAvailable;

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleAddToCart(product)}
                      className={cn(
                        "relative bg-white rounded-xl border-2 transition-all p-3 flex flex-col justify-between cursor-pointer select-none",
                        inCartQty > 0
                          ? "border-[var(--leaf)] shadow-[3px_3px_0px_var(--forest)] ring-2 ring-[var(--leaf)]/20"
                          : "border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] hover:shadow-[3px_3px_0px_var(--forest)] hover:-translate-y-0.5",
                        isOutOfStock && "opacity-60 bg-zinc-100 cursor-not-allowed pointer-events-none"
                      )}
                    >
                      {/* Image / Fallback */}
                      <div className="relative aspect-4/3 w-full bg-[var(--surface-2)] rounded-lg flex items-center justify-center overflow-hidden border border-zinc-200 mb-2.5">
                        {product.imagePath ? (
                          <Image
                            src={product.imagePath}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 45vw, 240px"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white border border-[var(--forest)] shadow-[1px_1px_0px_var(--forest)] flex items-center justify-center">
                            {getFallbackIcon(product.name)}
                          </div>
                        )}

                        {/* In Cart Badge */}
                        {inCartQty > 0 && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[var(--leaf)] text-white text-xs font-heading font-extrabold flex items-center justify-center shadow-md border border-white">
                            {inCartQty}
                          </div>
                        )}

                        {/* Out of stock */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <span className="px-2 py-0.5 rounded bg-[var(--danger)] text-white text-[10px] font-bold">
                              HABIS
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info & Add */}
                      <div className="space-y-1">
                        <h4 className="font-heading font-bold text-xs sm:text-sm text-zinc-950 line-clamp-2 leading-snug">
                          {product.name}
                        </h4>
                        <div className="flex items-center justify-between pt-1">
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
                            className="w-7 h-7 rounded-md bg-[var(--surface-2)] hover:bg-[var(--leaf)] text-[var(--forest)] hover:text-white border border-[var(--forest)] flex items-center justify-center transition-colors cursor-pointer"
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

        {/* RIGHT COLUMN: Rincian Nota & Kalkulator Kasir (5 Kolom) */}
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
                onClick={handleClearCart}
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
                      onChange={(val) => handleUpdateQty(ci.product.id, val)}
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
                onChange={(e) => setOrderNote(e.target.value)}
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
                  onClick={() => setPaymentMethod("cash")}
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
                  onClick={() => setPaymentMethod("qris")}
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
                  <span className="font-semibold text-zinc-700">Uang Tunai Diterima:</span>
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
                        setCashReceivedInput(raw);
                      }}
                      className="w-full h-8 pl-9 pr-2 rounded-lg border border-zinc-300 text-xs font-mono font-bold text-right text-zinc-950 focus:outline-none focus:ring-1 focus:ring-[var(--leaf)]"
                    />
                  </div>
                </div>

                {/* Quick Cash Presets */}
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
                      {subtotal > 0 ? "QRIS Dinamis (Nominal Otomatis)" : "QRIS Toko"}
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
                        onClick={() => setShowLargeQrModal(true)}
                        className="text-xs text-[var(--forest)] hover:text-[var(--leaf)] font-bold underline flex items-center gap-1.5 cursor-pointer py-0.5"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Perbesar Tampilan QR untuk Pelanggan</span>
                      </button>
                    )}

                    {/* Rincian Petunjuk Bayar */}
                    <div className="w-full p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--forest)] space-y-1 text-left">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-700">Nominal Transfer:</span>
                        <span className="font-heading font-extrabold text-sm text-[var(--forest)]">
                          {formatRupiah(subtotal)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-tight">
                        Tunjukkan QR ini ke pembeli. Scan menggunakan GoPay, OVO, DANA, BCA, ShopeePay, atau m-Banking.
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
                      Toko <strong>{storeName}</strong> belum menyimpan kode/payload QRIS di pengaturan toko.
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

      {/* 3. Modal Sukses Transaksi Kasir POS (Struk & Nomor Antrian) */}
      {successOrder && (
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
                  onClick={() => callQueueVoice(successOrder.result.queueNumber)}
                  className="gap-1.5 text-xs font-bold shadow-[2px_2px_0px_var(--forest)]"
                >
                  <Volume2 className="w-4 h-4 text-[var(--leaf)]" />
                  <span>Panggil Suara</span>
                </Button>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleNewOrder}
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
      )}

      {/* 4. Modal Tampilan Penuh QRIS untuk Pelanggan */}
      {showLargeQrModal && qrisDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs no-print animate-in fade-in duration-150">
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
