"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, Utensils, Cake, Coffee, IceCream, Cookie } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";

export interface ProductItem {
  id: string;
  name: string;
  description: string | null;
  price_sell: number;
  is_available: boolean;
  image_path?: string | null;
  category_name?: string | null;
}

export interface ProductCardProps {
  product: ProductItem;
  cartQty?: number;
  onAddToCart?: () => void;
  onUpdateQty?: (qty: number) => void;
  className?: string;
}

export function ProductCard({
  product,
  cartQty = 0,
  onAddToCart,
  onUpdateQty,
  className,
}: ProductCardProps) {
  const isOutOfStock = !product.is_available;

  // Fallback icon based on keywords
  const getFallbackIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("cake") || lower.includes("kue") || lower.includes("tart")) {
      return <Cake className="w-6 h-6 text-[var(--forest)]" />;
    }
    if (lower.includes("kopi") || lower.includes("coffee") || lower.includes("teh") || lower.includes("tea")) {
      return <Coffee className="w-6 h-6 text-amber-700" />;
    }
    if (lower.includes("es") || lower.includes("ice") || lower.includes("gelato")) {
      return <IceCream className="w-6 h-6 text-blue-600" />;
    }
    if (lower.includes("roti") || lower.includes("croissant") || lower.includes("pastry") || lower.includes("cookie")) {
      return <Cookie className="w-6 h-6 text-amber-800" />;
    }
    return <Utensils className="w-6 h-6 text-[var(--forest)]" />;
  };

  return (
    <div
      className={cn(
        "bg-white border-2 border-[var(--forest)] rounded-[8px] shadow-[3px_3px_0px_var(--forest)] hover:shadow-[4px_4px_0px_var(--forest)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all flex flex-col justify-between overflow-hidden relative group",
        isOutOfStock && "opacity-85 bg-[var(--surface-2)]",
        className
      )}
    >
      <div>
        {/* Visual Media 4:3 Ratio (design.md 9.6 & 6.5) */}
        <div className="relative aspect-4/3 w-full bg-[var(--surface-2)] flex items-center justify-center overflow-hidden border-b-2 border-[var(--forest)]">
          {product.image_path ? (
            <Image
              src={product.image_path}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-transform duration-300 group-hover:scale-105",
                isOutOfStock && "grayscale"
              )}
              sizes="(max-width: 640px) 50vw, 280px"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3">
              <div className="w-12 h-12 rounded-[8px] bg-white border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] flex items-center justify-center">
                {getFallbackIcon(product.name)}
              </div>
            </div>
          )}

          {/* Out of Stock Stamp (design.md 9.6) */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="px-3 py-1 rounded-[6px] bg-[var(--danger)] text-white border-2 border-[#7C2011] shadow-[2px_2px_0px_#7C2011] font-heading font-bold text-xs tracking-wider">
                HABIS
              </span>
            </div>
          )}

          {/* Category Tag */}
          {product.category_name && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-[6px] bg-white text-[var(--forest)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] text-[10px] font-semibold leading-none">
              {product.category_name}
            </span>
          )}
        </div>

        {/* Content Details */}
        <div className="p-3.5 space-y-1">
          <h3 className="font-heading font-semibold text-sm sm:text-base text-[var(--forest)] leading-snug line-clamp-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed font-normal">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer (Price & Stepper/Add) */}
      <div className="p-3.5 pt-1 flex items-center justify-between gap-2 border-t-2 border-dashed border-[var(--line)] mt-2 bg-white">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Harga
          </span>
          <span className="font-heading font-bold text-sm sm:text-base text-[var(--forest)] tabular-nums">
            {formatRupiah(product.price_sell)}
          </span>
        </div>

        <div>
          {isOutOfStock ? (
            <button
              disabled
              className="h-8 px-2.5 rounded-[6px] bg-[var(--disabled-bg)] text-[var(--disabled-text)] border-2 border-[var(--control)] text-xs font-medium cursor-not-allowed select-none"
            >
              Habis
            </button>
          ) : cartQty > 0 ? (
            <QuantityStepper
              value={cartQty}
              onChange={(newQty) => onUpdateQty && onUpdateQty(newQty)}
              size="sm"
            />
          ) : (
            <button
              type="button"
              onClick={onAddToCart}
              className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-[6px] bg-[var(--leaf)] hover:bg-[var(--leaf-hover)] text-white border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-semibold cursor-pointer select-none transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tambah</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
