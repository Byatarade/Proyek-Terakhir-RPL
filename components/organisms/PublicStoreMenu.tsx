"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicCategory, PublicProduct, createCustomerOrderAction } from "@/lib/public-menu/actions";
import { ProductCard } from "@/components/molecules/ProductCard";
import { ReceiptCart, CartItem } from "@/components/organisms/ReceiptCart";

export interface PublicStoreMenuProps {
  slug: string;
  storeName: string;
  isOpen: boolean;
  acceptCash: boolean;
  acceptQris: boolean;
  categories: PublicCategory[];
}

export function PublicStoreMenu({
  slug,
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

  return (
    <div className="space-y-4">
      {/* 1. Sticky Category Bar & Search */}
      <div className="sticky top-14 z-20 bg-white/95 backdrop-blur-md border-b border-[var(--line)] py-3 px-4 space-y-2.5">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari menu favorit kamu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9.5 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40 focus:border-[var(--leaf)] transition-all"
          />
        </div>

        {/* Category Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategoryTab("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer",
              activeCategoryTab === "all"
                ? "bg-zinc-950 text-white shadow-2xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80"
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
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer",
                activeCategoryTab === cat.id
                  ? "bg-zinc-950 text-white shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80"
              )}
            >
              {cat.name} ({cat.products.length})
            </button>
          ))}
        </div>
      </div>

      {/* Error alert if any */}
      {orderError && (
        <div className="mx-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {orderError}
        </div>
      )}

      {/* 2. Product Sections Grouped by Category */}
      <div className="px-4 space-y-6 pt-1">
        {displayedCategories.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-zinc-50 rounded-2xl border border-zinc-200/70 my-6">
            <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-900">
              Menu Tidak Ditemukan
            </h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Tidak ada produk yang cocok dengan pencarian &quot;{searchQuery}&quot;. Silakan coba kata kunci lain.
            </p>
          </div>
        ) : (
          displayedCategories.map((cat) => (
            <section key={cat.id} className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <h2 className="font-heading font-bold text-base sm:text-lg text-zinc-950">
                  {cat.name}
                </h2>
                <span className="text-[11px] font-medium text-zinc-400 font-mono">
                  {cat.products.length} menu
                </span>
              </div>

              {/* Grid 2 Columns on Mobile / Tablet */}
              <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
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
    </div>
  );
}
