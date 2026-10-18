"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActiveTab, StatsData } from "./SummaryCards";

interface StatusTabsProps {
  activeTab: ActiveTab;
  stats: StatsData;
  searchQuery: string;
  onTabChange: (tab: ActiveTab) => void;
  onSearchChange: (q: string) => void;
}

/**
 * StatusTabs — Tab navigasi filter status + search box nomor antrian.
 * Dipisahkan dari SummaryCards karena tanggung jawabnya berbeda:
 * tab ini untuk navigasi cepat, bukan untuk menampilkan statistik.
 */
export function StatusTabs({
  activeTab,
  stats,
  searchQuery,
  onTabChange,
  onSearchChange,
}: StatusTabsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Tabs Filter */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => onTabChange("all_active")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
            activeTab === "all_active"
              ? "bg-white text-[var(--forest)] shadow-2xs"
              : "text-zinc-600 hover:text-zinc-900"
          )}
        >
          Semua Aktif (
          {stats.waitingCount + stats.readyCount + stats.kitchenCount})
        </button>

        <button
          type="button"
          onClick={() => onTabChange("menunggu_bayar")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
            activeTab === "menunggu_bayar"
              ? "bg-white text-amber-800 shadow-2xs"
              : "text-zinc-600 hover:text-zinc-900"
          )}
        >
          Antre Bayar ({stats.waitingCount})
        </button>

        <button
          type="button"
          onClick={() => onTabChange("siap")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
            activeTab === "siap"
              ? "bg-white text-[var(--leaf)] shadow-2xs"
              : "text-zinc-600 hover:text-zinc-900"
          )}
        >
          Siap Diambil ({stats.readyCount})
        </button>

        <button
          type="button"
          onClick={() => onTabChange("dapur")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
            activeTab === "dapur"
              ? "bg-white text-[var(--blue)] shadow-2xs"
              : "text-zinc-600 hover:text-zinc-900"
          )}
        >
          Di Dapur ({stats.kitchenCount})
        </button>

        <button
          type="button"
          onClick={() => onTabChange("selesai")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
            activeTab === "selesai"
              ? "bg-white text-zinc-900 shadow-2xs"
              : "text-zinc-600 hover:text-zinc-900"
          )}
        >
          Selesai / Batal
        </button>
      </div>

      {/* Search Box Nomor Antrian */}
      <div className="relative w-full sm:w-64">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari no. antrian (cth: 001) / menu..."
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-[var(--line)] bg-white text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--forest)]"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
