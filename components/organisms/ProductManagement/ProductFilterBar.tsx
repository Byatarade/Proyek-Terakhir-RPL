import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductFilterBarProps, StatusFilterType } from "./types";

export function ProductFilterBar({
  categories,
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: ProductFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer",
            selectedCategory === "all"
              ? "bg-zinc-950 text-white shadow-2xs"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
          )}
        >
          Semua Kategori ({products.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer",
              selectedCategory === cat.id
                ? "bg-zinc-950 text-white shadow-2xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
            )}
          >
            {cat.name} ({products.filter((p) => p.category_id === cat.id).length})
          </button>
        ))}
      </div>

      {/* Search & Status Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama produk atau deskripsi menu..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-9.5 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40 focus:border-[var(--leaf)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as StatusFilterType)}
            className="h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40 w-full sm:w-auto cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="best_seller">Hanya Terlaris 🔥</option>
            <option value="available">Hanya Tersedia</option>
            <option value="unavailable">Hanya Habis</option>
            <option value="hidden">Hanya Sembunyi</option>
          </select>
        </div>
      </div>
    </div>
  );
}
