import React from "react";
import { Flame } from "lucide-react";
import { ProductStatCardsProps } from "./types";

export function ProductStatCards({
  totalProducts,
  totalAvailable,
  totalUnavailable,
  totalHidden,
  totalBestSeller = 0,
}: ProductStatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/70 space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Total Produk
        </span>
        <div className="font-heading font-bold text-2xl text-zinc-950 tabular-nums">
          {totalProducts}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1">
          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
          Menu Terlaris
        </span>
        <div className="font-heading font-bold text-2xl text-amber-600 tabular-nums">
          {totalBestSeller}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
          Tersedia (Ready)
        </span>
        <div className="font-heading font-bold text-2xl text-emerald-600 tabular-nums">
          {totalAvailable}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60 space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
          Sementara Habis
        </span>
        <div className="font-heading font-bold text-2xl text-rose-600 tabular-nums">
          {totalUnavailable}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-100/60 border border-zinc-200/70 space-y-1 col-span-2 lg:col-span-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Disembunyikan
        </span>
        <div className="font-heading font-bold text-2xl text-zinc-700 tabular-nums">
          {totalHidden}
        </div>
      </div>
    </div>
  );
}
