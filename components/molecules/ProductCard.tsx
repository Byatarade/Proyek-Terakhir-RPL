"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, Utensils, Cake, Coffee, IceCream, Cookie } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { Badge } from "@/components/atoms/Badge";

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

  // Helper icon based on product name keywords
  const getFallbackIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("cake") || lower.includes("kue") || lower.includes("tart")) {
      return <Cake className="w-8 h-8 text-[var(--leaf)]" />;
    }
    if (lower.includes("kopi") || lower.includes("coffee") || lower.includes("teh") || lower.includes("tea")) {
      return <Coffee className="w-8 h-8 text-amber-600" />;
    }
    if (lower.includes("es") || lower.includes("ice") || lower.includes("gelato")) {
      return <IceCream className="w-8 h-8 text-blue-500" />;
    }
    if (lower.includes("roti") || lower.includes("croissant") || lower.includes("pastry") || lower.includes("cookie")) {
      return <Cookie className="w-8 h-8 text-amber-700" />;
    }
    return <Utensils className="w-8 h-8 text-zinc-400" />;
  };

  return (
    <div
      className={cn(
        "bg-white border border-[var(--line)] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-2xs hover:shadow-sm",
        isOutOfStock && "opacity-75 bg-zinc-50/50",
        className
      )}
    >
      <div>
        {/* Product Visual (4:3 aspect ratio per design.md 9.6) */}
        <div className="relative aspect-4/3 w-full bg-zinc-100 flex items-center justify-center overflow-hidden border-b border-zinc-100">
          {product.image_path ? (
            <Image
              src={product.image_path}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-transform duration-300 group-hover:scale-105",
                isOutOfStock && "grayscale"
              )}
              sizes="(max-width: 640px) 100vw, 560px"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50/80 p-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-200/80 flex items-center justify-center shadow-2xs">
                {getFallbackIcon(product.name)}
              </div>
            </div>
          )}

          {/* Out of stock badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-2xs flex items-center justify-center">
              <Badge variant="neutral" size="sm" className="font-semibold bg-zinc-900 text-white border-0 px-3 py-1">
                Habis
              </Badge>
            </div>
          )}

          {/* Category tag */}
          {product.category_name && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-zinc-700 border border-zinc-200/60 shadow-2xs">
              {product.category_name}
            </span>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-1.5">
          <h3 className="font-heading font-semibold text-sm sm:text-base text-zinc-950 leading-snug line-clamp-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed font-normal">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer Price & Stepper/Add Button */}
      <div className="p-4 pt-1 flex items-center justify-between gap-3 border-t border-zinc-100 mt-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            Harga
          </span>
          <span className="font-heading font-bold text-sm sm:text-base text-zinc-950 tabular-nums">
            {formatRupiah(product.price_sell)}
          </span>
        </div>

        <div>
          {isOutOfStock ? (
            <button
              disabled
              className="h-9 px-3.5 rounded-xl bg-zinc-100 text-zinc-400 text-xs font-medium cursor-not-allowed select-none"
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
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-emerald-50 text-[var(--leaf)] hover:bg-[var(--leaf)] hover:text-white border border-emerald-200/80 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
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
