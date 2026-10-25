import React, { useMemo } from "react";
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
} from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";
import { CashierCatalog, CashierProductItem } from "@/lib/cashier/actions";
import { CartItem } from "./types";

interface PosMenuSectionProps {
  catalog: CashierCatalog;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
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

export function PosMenuSection({
  catalog,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchQueryChange,
  cart,
  onAddToCart,
}: PosMenuSectionProps) {
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

  return (
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
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full h-10 pl-9 pr-9 rounded-xl border-2 border-[var(--forest)] bg-white text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)] shadow-[2px_2px_0px_var(--forest)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap",
              selectedCategory === "all"
                ? "bg-white text-[var(--forest)] shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            Semua ({catalog.products.length})
          </button>

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
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap",
                  selectedCategory === cat.id
                    ? "bg-white text-[var(--forest)] shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-900"
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
                  onClick={() => onAddToCart(product)}
                  className={cn(
                    "relative bg-white rounded-xl border-2 transition-all p-2.5 flex flex-col justify-between cursor-pointer select-none",
                    inCartQty > 0
                      ? "border-[var(--leaf)] shadow-[3px_3px_0px_var(--forest)] ring-2 ring-[var(--leaf)]/20"
                      : "border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] hover:shadow-[3px_3px_0px_var(--forest)] hover:-translate-y-0.5",
                    isOutOfStock &&
                      "opacity-60 bg-zinc-100 cursor-not-allowed pointer-events-none"
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
                          onAddToCart(product);
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
  );
}
