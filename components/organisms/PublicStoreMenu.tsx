"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Bell,
  ChefHat,
  ArrowRight,
  CheckCircle2,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  Clock,
  Volume2,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  X,
} from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn, formatRupiah } from "@/lib/utils";
import {
  PublicCategory,
  PublicProduct,
  createCustomerOrderAction,
  getOrderStatusAction,
  OrderStatusData,
} from "@/lib/public-menu/actions";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/molecules/ProductCard";
import { ReceiptCart, CartItem } from "@/components/organisms/ReceiptCart";
import { Button } from "@/components/atoms/Button";

export interface PublicStoreMenuProps {
  slug: string;
  storeName: string;
  isOpen: boolean;
  acceptCash: boolean;
  acceptQris: boolean;
  categories: PublicCategory[];
}

interface ActiveOrderInfo {
  token: string;
  queueNumber: number;
  status?: string;
  updatedAt?: string;
}

// Suara Chime Panggilan Pesanan Siap
function playMenuChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(880, now + 0.2); // A5
    gain2.gain.setValueAtTime(0.35, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.85);
  } catch {
    // Ignore audio restriction
  }
}

// Suara Panggilan Bahasa Indonesia
function speakMenuCall(queueNumber: number) {
  playMenuChime();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const formatted = String(queueNumber).padStart(3, "0");
    const utterance = new SpeechSynthesisUtterance(
      `Nomor antrian ${formatted}, pesananmu sudah siap diambil di kasir.`
    );
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 350);
  }
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([300, 150, 300, 150, 400]);
    } catch {
      // Ignore vibration error
    }
  }
}

export function PublicStoreMenu({
  slug,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  storeName,
  isOpen,
  acceptCash,
  acceptQris,
  categories,
}: PublicStoreMenuProps) {
  const router = useRouter();
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Active order state for customers who return to QR menu
  const [activeOrder, setActiveOrder] = useState<ActiveOrderInfo | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatusData | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);

  const prevStatusRef = useRef<string | null>(null);
  const prevUpdatedAtRef = useRef<string | null>(null);
  const acknowledgedCallRef = useRef<boolean>(false);

  // 1. Cek active order dari localStorage saat pelanggan berada di menu toko
  useEffect(() => {
    setTimeout(() => {
      try {
        const stored = localStorage.getItem(`paybuy_active_order_${slug}`);
        if (stored) {
          const parsed = JSON.parse(stored) as ActiveOrderInfo;
          if (parsed.token) {
            setActiveOrder(parsed);
          }
        }
      } catch {
        // Ignore error
      }
    }, 0);
  }, [slug]);

  // 2. Poll dan subscribe status pesanan aktif
  useEffect(() => {
    if (!activeOrder?.token) return;

    const checkOrderStatus = async () => {
      const res = await getOrderStatusAction(activeOrder.token, slug);
      if (res.success && res.data) {
        setOrderStatus(res.data);

        // Jika status selesai diambil atau dibatalkan, bersihkan dari active order
        if (res.data.status === "diambil" || res.data.status === "dibatalkan") {
          try {
            localStorage.removeItem(`paybuy_active_order_${slug}`);
          } catch {}
          return;
        }

        // Deteksi jika pesanan siap atau jika koki/kasir memanggil ulang
        const isNewlyReady =
          prevStatusRef.current &&
          prevStatusRef.current !== "siap" &&
          res.data.status === "siap";

        const isReCalled =
          prevUpdatedAtRef.current &&
          prevUpdatedAtRef.current !== res.data.updatedAt &&
          res.data.status === "siap";

        const shouldAlert =
          isNewlyReady ||
          isReCalled ||
          (!acknowledgedCallRef.current && res.data.status === "siap");

        if (shouldAlert) {
          setShowCallModal(true);
          speakMenuCall(res.data.queueNumber);
        }

        prevStatusRef.current = res.data.status;
        prevUpdatedAtRef.current = res.data.updatedAt || null;
      }
    };

    checkOrderStatus();

    // Supabase Realtime channel
    const supabase = createClient();
    const channel = supabase
      .channel(`menu-order-status-${activeOrder.token}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        () => {
          checkOrderStatus();
        }
      )
      .subscribe();

    // Polling interval setiap 4 detik
    const interval = setInterval(checkOrderStatus, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [activeOrder?.token, slug]);

  // Cart operations
  const handleAddToCart = (product: PublicProduct) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(product.id);
      if (existing) {
        next.set(product.id, { product, qty: existing.qty + 1 });
      } else {
        next.set(product.id, { product, qty: 1 });
      }
      return next;
    });
  };

  const handleUpdateQty = (productId: string, qty: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      if (qty <= 0) {
        next.delete(productId);
      } else {
        const item = next.get(productId);
        if (item) {
          next.set(productId, { ...item, qty });
        }
      }
      return next;
    });
  };

  const handleClearCart = () => {
    setCart(new Map());
  };

  // Submit Order
  const handleSubmitOrder = async (paymentMethod: "cash" | "qris") => {
    try {
      setIsSubmitting(true);
      setOrderError(null);

      const items = Array.from(cart.values()).map((item) => ({
        productId: item.product.id,
        qty: item.qty,
      }));

      const res = await createCustomerOrderAction({
        slug,
        items,
        paymentMethod,
      });

      if (!res.success || !res.data) {
        setOrderError(res.error || "Gagal membuat pesanan. Silakan coba kembali.");
        setIsSubmitting(false);
        return;
      }

      // Simpan ke localStorage agar jika user membuka /t/[slug] kembali, pesanan tetap terpantau
      try {
        localStorage.setItem(
          `paybuy_active_order_${slug}`,
          JSON.stringify({
            token: res.data.publicToken,
            queueNumber: res.data.queueNumber,
            storeSlug: slug,
            createdAt: Date.now(),
          })
        );
      } catch {}

      // Redirect to Order Status & Queue Tracker page
      router.push(`/t/${slug}/pesanan/${res.data.publicToken}`);
    } catch {
      setOrderError("Terjadi gangguan koneksi saat mengirim pesanan.");
      setIsSubmitting(false);
    }
  };

  // Filter categories and products
  const filteredCategories = categories
    .map((cat) => {
      const filteredProducts = cat.products.filter((prod) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          prod.name.toLowerCase().includes(q) ||
          prod.description?.toLowerCase().includes(q)
        );
      });
      return {
        ...cat,
        products: filteredProducts,
      };
    })
    .filter((cat) => cat.products.length > 0);

  const displayedCategories =
    activeCategoryTab === "all"
      ? filteredCategories
      : filteredCategories.filter((c) => c.id === activeCategoryTab);

  const cartItemsArray = Array.from(cart.values());

  const activeQueueFormatted = activeOrder?.queueNumber
    ? String(activeOrder.queueNumber).padStart(3, "0")
    : null;

  return (
    <div className="space-y-4">
      {/* 0. Banner Pesanan Aktif Pelanggan di Halaman Menu */}
      {activeOrder && orderStatus && orderStatus.status !== "diambil" && orderStatus.status !== "dibatalkan" && (
        <div className="mx-4 mt-2">
          {orderStatus.status === "siap" ? (
            <div className="p-3.5 rounded-[8px] bg-[var(--mint)] border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] bg-[var(--forest)] text-[var(--mint)] flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <span className="font-heading font-extrabold text-xs text-[var(--forest)] block leading-tight">
                    Antrian #{activeQueueFormatted} SIAP DIAMBIL!
                  </span>
                  <span className="text-[11px] text-[var(--forest)] font-medium">
                    Silakan menuju ke meja kasir sekarang
                  </span>
                </div>
              </div>
              <Link href={`/t/${slug}/pesanan/${activeOrder.token}`}>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-[6px] bg-[var(--forest)] hover:bg-[var(--forest-2)] text-white text-xs font-bold shadow-[2px_2px_0px_white] cursor-pointer"
                >
                  Lihat Nota
                </button>
              </Link>
            </div>
          ) : (
            <Link
              href={`/t/${slug}/pesanan/${activeOrder.token}`}
              className="block p-3 rounded-[8px] bg-white border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] hover:bg-[var(--surface-2)] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[6px] bg-[var(--forest)] text-white flex items-center justify-center shrink-0">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-heading font-bold text-xs text-[var(--forest)] block leading-tight">
                      Antrian Kamu: #{activeQueueFormatted}
                    </span>
                    <span className="text-[11px] text-[var(--muted)]">
                      {orderStatus.status === "diproses"
                        ? "Sedang dimasak oleh koki di dapur"
                        : "Menunggu giliran masak koki"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[var(--leaf)]">
                  <span>Pantau</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* 1. Sticky Category Bar & Search with Hijau Nota styles */}
      <div className="sticky top-[57px] z-20 bg-[var(--bg)] border-b-2 border-[var(--forest)] py-3 px-4 space-y-2.5">
        {/* Search Bar (design.md 7.2) */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[var(--forest)] absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
          <input
            type="text"
            placeholder="Cari menu favorit kamu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-[8px] bg-white border-2 border-[var(--control)] focus:border-[var(--forest)] text-xs sm:text-sm text-[var(--ink)] placeholder:text-[var(--muted)] shadow-[2px_2px_0px_var(--forest)] focus:outline-none transition-all"
          />
        </div>

        {/* Category Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-0.5">
          <button
            type="button"
            onClick={() => setActiveCategoryTab("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer border-2",
              activeCategoryTab === "all"
                ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                : "bg-white text-[var(--forest)] border-[var(--forest)] hover:bg-[var(--surface-2)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            )}
          >
            Semua Menu
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryTab(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer border-2",
                activeCategoryTab === cat.id
                  ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                  : "bg-white text-[var(--forest)] border-[var(--forest)] hover:bg-[var(--surface-2)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              )}
            >
              {cat.name} ({cat.products.length})
            </button>
          ))}
        </div>
      </div>

      {/* Error alert if any */}
      {orderError && (
        <div className="mx-4 p-3.5 rounded-[8px] bg-red-50 border-2 border-[var(--danger)] text-xs text-[var(--danger)] font-semibold shadow-[2px_2px_0px_var(--danger)]">
          {orderError}
        </div>
      )}

      {/* 2. Product Sections Grouped by Category */}
      <div className="px-4 space-y-6 pt-1">
        {displayedCategories.length === 0 ? (
          <div className="p-8 text-center space-y-3 bg-white rounded-[8px] border-2 border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] my-6">
            <div className="w-12 h-12 rounded-[8px] bg-[var(--surface-2)] border-2 border-[var(--forest)] flex items-center justify-center text-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-[var(--forest)]">
              {searchQuery.trim() ? "Menu Tidak Ditemukan" : "Menu Belum Tersedia"}
            </h3>
            <p className="text-xs text-[var(--muted)] max-w-xs mx-auto">
              {searchQuery.trim()
                ? `Tidak ada produk yang cocok dengan pencarian "${searchQuery}". Silakan coba kata kunci lain.`
                : "Toko ini belum menambahkan daftar menu yang tersedia. Silakan hubungi kasir atau coba kembali nanti."}
            </p>
          </div>
        ) : (
          displayedCategories.map((cat) => (
            <section key={cat.id} className="space-y-3">
              <div className="flex items-center justify-between border-b-2 border-dashed border-[var(--line)] pb-2">
                <h2 className="font-heading font-bold text-base sm:text-lg text-[var(--forest)]">
                  {cat.name}
                </h2>
                <span className="text-xs font-semibold text-[var(--forest)] font-mono bg-[var(--surface-2)] border-2 border-[var(--forest)] px-2 py-0.5 rounded-[6px] shadow-[1px_1px_0px_var(--forest)]">
                  {cat.products.length} menu
                </span>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                {cat.products.map((product) => {
                  const cartItem = cart.get(product.id);
                  const qty = cartItem ? cartItem.qty : 0;

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      cartQty={qty}
                      onAddToCart={() => isOpen && handleAddToCart(product)}
                      onUpdateQty={(newQty) => handleUpdateQty(product.id, newQty)}
                    />
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {/* 3. Floating Bottom Bar & Receipt Cart Drawer */}
      <ReceiptCart
        items={cartItemsArray}
        onUpdateQty={handleUpdateQty}
        onClearCart={handleClearCart}
        acceptCash={acceptCash}
        acceptQris={acceptQris}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />

      {/* 4. MODAL PANGGILAN ANTRIAN DI HALAMAN MENU TOKO */}
      {showCallModal && activeOrder && orderStatus && orderStatus.status === "siap" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#12201A]/80 transition-opacity animate-in fade-in duration-200"
            onClick={() => {
              acknowledgedCallRef.current = true;
              setShowCallModal(false);
            }}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-[420px] bg-white rounded-[8px] border-3 border-[var(--forest)] shadow-[6px_6px_0px_var(--forest)] overflow-hidden z-10 p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[var(--mint)] border-2 border-[var(--forest)] text-[var(--forest)] text-xs font-extrabold shadow-[2px_2px_0px_var(--forest)]">
              <Bell className="w-4 h-4 animate-bounce stroke-[2.5]" />
              <span>PANGGILAN ANTRIAN PESANAN</span>
            </div>

            <div className="p-5 rounded-[8px] border-3 border-dashed border-[var(--forest)] bg-[var(--mint)] shadow-[3px_3px_0px_var(--forest)] space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--forest)] opacity-90 block">
                Nomor Antrian Kamu
              </span>
              <div className="font-heading font-extrabold text-6xl sm:text-7xl text-[var(--forest)] tabular-nums tracking-tight">
                #{activeQueueFormatted}
              </div>
              <span className="text-xs font-bold text-[var(--forest)] block">
                Pesanan Sudah Selesai Dimasak!
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-heading font-extrabold text-xl text-[var(--forest)]">
                Silakan Ambil di Meja Kasir
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed max-w-xs mx-auto">
                Koki di dapur telah selesai memasak pesananmu. Tunjukkan nomor antrian ini ke kasir untuk mengambil makananmu!
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Link href={`/t/${slug}/pesanan/${activeOrder.token}`}>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full gap-2 font-heading font-bold text-sm sm:text-base h-13 shadow-[3px_3px_0px_var(--forest)] cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>Lihat Nota & Ambil di Kasir</span>
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => speakMenuCall(activeOrder.queueNumber)}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--forest)] hover:underline py-1 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Dengarkan Ulang Suara Panggilan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
