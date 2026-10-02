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

        {/* Category Tabs Navigation: Solid 8px radius buttons with 2px borders (design.md 5.1 & 8) */}
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
    </div>
  );
}
