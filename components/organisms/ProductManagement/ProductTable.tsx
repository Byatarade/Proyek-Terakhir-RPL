import React from "react";
import Image from "next/image";
import {
  Cake,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Flame,
} from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { ProductTableProps } from "./types";

export function ProductTable({
  products,
  onToggleAvailability,
  onToggleActive,
  onToggleBestSeller,
  onEditProduct,
  onDeleteProduct,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden shadow-2xs p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
          <Cake className="w-6 h-6" />
        </div>
        <h3 className="font-heading font-bold text-base text-zinc-900">
          Tidak Ada Produk yang Sesuai
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Coba ubah kata kunci pencarian atau filter status untuk menemukan produk yang diinginkan.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-5">Produk</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4 text-right">Harga Jual</th>
              <th className="py-3 px-4 text-right">Harga Modal</th>
              <th className="py-3 px-4 text-right">Margin / Laba</th>
              <th className="py-3 px-4 text-center">Terlaris</th>
              <th className="py-3 px-4 text-center">Ketersediaan</th>
              <th className="py-3 px-4 text-center">Tampil</th>
              <th className="py-3 px-4 sm:px-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm font-normal text-zinc-900">
            {products.map((prod) => {
              const margin = prod.price_sell - prod.price_cost;
              const marginPercent =
                prod.price_sell > 0
                  ? Math.round((margin / prod.price_sell) * 100)
                  : 0;

              return (
                <tr
                  key={prod.id}
                  className={cn(
                    "hover:bg-zinc-50/80 transition-colors",
                    !prod.is_active && "opacity-60 bg-zinc-50/40"
                  )}
                >
                  {/* Product Image, Name & Description */}
                  <td className="py-3.5 px-4 sm:px-5 max-w-[280px]">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 shrink-0 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/80 flex items-center justify-center">
                        {prod.image_path ? (
                          <Image
                            src={prod.image_path}
                            alt={prod.name}
                            fill
                            unoptimized={prod.image_path.startsWith("data:")}
                            className="object-cover"
                          />
                        ) : (
                          <Cake className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-zinc-950 leading-tight">
                            {prod.name}
                          </span>
                          {prod.is_best_seller && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                              <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              Terlaris
                            </span>
                          )}
                        </div>
                        {prod.description && (
                          <div className="text-xs text-zinc-400 truncate mt-0.5 font-normal">
                            {prod.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-medium border border-zinc-200">
                      {prod.category_name || "Tanpa Kategori"}
                    </span>
                  </td>

                  {/* Selling Price */}
                  <td className="py-3.5 px-4 text-right font-heading font-semibold text-zinc-950 tabular-nums">
                    {formatRupiah(prod.price_sell)}
                  </td>

                  {/* Cost Price */}
                  <td className="py-3.5 px-4 text-right font-mono text-xs text-zinc-500 tabular-nums">
                    {formatRupiah(prod.price_cost)}
                  </td>

                  {/* Profit Margin */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap tabular-nums">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--leaf)]">
                      <TrendingUp className="w-3 h-3" />
                      <span>+{formatRupiah(margin)}</span>
                      <span className="text-[10px] text-zinc-400">({marginPercent}%)</span>
                    </span>
                  </td>

                  {/* Best Seller Toggle */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleBestSeller(prod)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer",
                        prod.is_best_seller
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 shadow-2xs"
                          : "bg-zinc-100/80 text-zinc-400 hover:bg-zinc-200/80 hover:text-zinc-600 border border-transparent"
                      )}
                      title={
                        prod.is_best_seller
                          ? "Menu terlaris aktif (klik untuk batalkan)"
                          : "Klik untuk jadikan menu terlaris"
                      }
                    >
                      <Flame
                        className={cn(
                          "w-3 h-3",
                          prod.is_best_seller ? "text-amber-500 fill-amber-500" : "text-zinc-400"
                        )}
                      />
                      <span>{prod.is_best_seller ? "Terlaris" : "Biasa"}</span>
                    </button>
                  </td>

                  {/* Availability Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleAvailability(prod)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer",
                        prod.is_available
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                      )}
                      title="Klik untuk ubah ketersediaan"
                    >
                      {prod.is_available ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Tersedia</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-amber-600" />
                          <span>Habis</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Active Visibility Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleActive(prod)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors cursor-pointer",
                        prod.is_active
                          ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                          : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                      )}
                      title={
                        prod.is_active
                          ? "Tampil di menu (klik untuk sembunyikan)"
                          : "Disembunyikan (klik untuk tampilkan)"
                      }
                    >
                      {prod.is_active ? (
                        <Eye className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEditProduct(prod)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                        title="Edit produk"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(prod)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus produk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
