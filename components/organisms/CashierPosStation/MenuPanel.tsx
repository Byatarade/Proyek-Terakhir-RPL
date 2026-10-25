import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Plus,
  X,
  Utensils,
  Cake,
  Coffee,
  IceCream,
  Cookie,
  Flame,
} from "lucide-react";
import { CashierCatalog, CashierProductItem } from "@/lib/cashier/actions";
import { formatRupiah, cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
import { CartItem } from "./types";

interface MenuPanelProps {
  catalog: CashierCatalog;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cart: Record<string, CartItem>;
  onAddToCart: (product: CashierProductItem) => void;
}

// Fallback icon based on keywords
function getFallbackIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("cake") || lower.includes("kue") || lower.includes("tart")) {
    return <Cake className="w-5 h-5 text-[var(--forest)]" />;
  }
  if (
    lower.includes("kopi") ||
    lower.includes("coffee") ||
    lower.includes("teh") ||
    lower.includes("tea")
  ) {
    return <Coffee className="w-5 h-5 text-amber-700" />;
  }
  if (lower.includes("es") || lower.includes("ice") || lower.includes("gelato")) {
    return <IceCream className="w-5 h-5 text-blue-600" />;
  }
  if (
    lower.includes("roti") ||
    lower.includes("croissant") ||
    lower.includes("pastry") ||
    lower.includes("cookie")
  ) {
    return <Cookie className="w-5 h-5 text-amber-800" />;
  }
  return <Utensils className="w-5 h-5 text-[var(--forest)]" />;
}

export function MenuPanel({
  catalog,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cart,
  onAddToCart,
}: MenuPanelProps) {
  // Hitung produk terlaris di katalog POS (diatur via dashboard)
  const bestSellersCount = useMemo(() => {
    return catalog.products.filter((p) => p.isBestSeller).length;
  }, [catalog.products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return catalog.products
      .filter((p) => {
        if (selectedCategory === "best_seller") {
          return Boolean(p.isBestSeller);
        }
        if (selectedCategory !== "all" && p.categoryId !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return p.name.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (selectedCategory === "best_seller") {
          return (b.totalSold || 0) - (a.totalSold || 0);
        }
        return 0;
      });
  }, [catalog.products, selectedCategory, searchQuery]);

  return (
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-9 rounded-xl border-2 border-[var(--forest)] bg-white text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)] shadow-[2px_2px_0px_var(--forest)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
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
            onClick={() => onSelectCategory("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border-2",
              selectedCategory === "all"
                ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400"
            )}
          >
            Semua ({catalog.products.length})
          </button>

          {bestSellersCount > 0 && (
            <button
              type="button"
              onClick={() => onSelectCategory("best_seller")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border-2 flex items-center gap-1.5",
                selectedCategory === "best_seller"
                  ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                  : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400"
              )}
            >
              <span>🔥 Terlaris</span>
              <span className="text-[10px] bg-[var(--surface-2)] text-[var(--forest)] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none">
                {bestSellersCount}
              </span>
            </button>
          )}

          {catalog.categories.map((cat) => {
            const count = catalog.products.filter(
              (p) => p.categoryId === cat.id
            ).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
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
                  onClick={() => onAddToCart(product)}
                  className={cn(
                    "relative bg-white rounded-xl border-2 transition-all p-3 flex flex-col justify-between cursor-pointer select-none",
                    inCartQty > 0
                      ? "border-[var(--leaf)] shadow-[3px_3px_0px_var(--forest)] ring-2 ring-[var(--leaf)]/20"
                      : "border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] hover:shadow-[3px_3px_0px_var(--forest)] hover:-translate-y-0.5",
                    isOutOfStock &&
                      "opacity-60 bg-zinc-100 cursor-not-allowed pointer-events-none"
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

                    {/* Best Seller Tag */}
                    {product.isBestSeller && (
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-[5px] bg-[var(--amber)] text-[var(--forest)] border border-[var(--forest)] text-[9px] font-extrabold flex items-center gap-1 shadow-xs z-10">
                        <Flame className="w-2.5 h-2.5 fill-current" />
                        <span>Terlaris</span>
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
                    {Boolean(product.totalSold && product.totalSold > 0) && (
                      <span className="text-[10px] text-zinc-500 font-medium block leading-none">
                        Terjual {product.totalSold}x
                      </span>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-xs font-bold text-[var(--leaf)]">
                        {formatRupiah(product.priceSell)}
                      </span>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
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
  );
}
