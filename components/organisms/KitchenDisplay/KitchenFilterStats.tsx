import React from "react";
import { Layers, ChefHat, Flame, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { KitchenFilterStatsProps } from "./types";

export function KitchenFilterStats({
  activeFilter,
  onSelectFilter,
  totalOrders,
  countWaiting,
  countCooking,
  countReady,
}: KitchenFilterStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Tab 1: Semua Dapur */}
      <button
        type="button"
        onClick={() => onSelectFilter("all")}
        className={cn(
          "p-3.5 rounded-[8px] border-2 border-[var(--forest)] text-left transition-all cursor-pointer",
          activeFilter === "all"
            ? "bg-[var(--forest)] text-white shadow-[4px_4px_0px_var(--forest)]"
            : "bg-white text-[var(--ink)] shadow-[2px_2px_0px_var(--forest)] hover:bg-[var(--surface-2)]"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            Total Antrian
          </span>
          <Layers className="w-4 h-4" />
        </div>
        <div className="font-heading font-extrabold text-2xl sm:text-3xl tabular-nums mt-1">
          {totalOrders}
        </div>
        <span className="text-[10px] sm:text-[11px] opacity-80 block mt-0.5 truncate">
          Semua pesanan dapur
        </span>
      </button>

      {/* Tab 2: Menunggu Dimasak (status: dibayar) */}
      <button
        type="button"
        onClick={() => onSelectFilter("dibayar")}
        className={cn(
          "p-3.5 rounded-[8px] border-2 border-[var(--forest)] text-left transition-all cursor-pointer",
          activeFilter === "dibayar"
            ? "bg-[var(--blue)] text-white shadow-[4px_4px_0px_var(--forest)]"
            : "bg-white text-[var(--ink)] shadow-[2px_2px_0px_var(--forest)] hover:bg-[var(--surface-2)]"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            1. Menunggu
          </span>
          <ChefHat className="w-4 h-4" />
        </div>
        <div className="font-heading font-extrabold text-2xl sm:text-3xl tabular-nums mt-1">
          {countWaiting}
        </div>
        <span className="text-[10px] sm:text-[11px] opacity-80 block mt-0.5 truncate">
          Perlu dimasak koki
        </span>
      </button>

      {/* Tab 3: Sedang Dimasak (status: diproses) */}
      <button
        type="button"
        onClick={() => onSelectFilter("diproses")}
        className={cn(
          "p-3.5 rounded-[8px] border-2 border-[var(--forest)] text-left transition-all cursor-pointer",
          activeFilter === "diproses"
            ? "bg-[var(--brick)] text-white shadow-[4px_4px_0px_var(--forest)]"
            : "bg-white text-[var(--ink)] shadow-[2px_2px_0px_var(--forest)] hover:bg-[var(--surface-2)]"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            2. Dimasak
          </span>
          <Flame className="w-4 h-4" />
        </div>
        <div className="font-heading font-extrabold text-2xl sm:text-3xl tabular-nums mt-1">
          {countCooking}
        </div>
        <span className="text-[10px] sm:text-[11px] opacity-80 block mt-0.5 truncate">
          Sedang diproses koki
        </span>
      </button>

      {/* Tab 4: Siap Dipanggil (status: siap) */}
      <button
        type="button"
        onClick={() => onSelectFilter("siap")}
        className={cn(
          "p-3.5 rounded-[8px] border-2 border-[var(--forest)] text-left transition-all cursor-pointer",
          activeFilter === "siap"
            ? "bg-[var(--mint)] text-[var(--forest)] shadow-[4px_4px_0px_var(--forest)]"
            : "bg-white text-[var(--ink)] shadow-[2px_2px_0px_var(--forest)] hover:bg-[var(--surface-2)]"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
            3. Siap Dipanggil
          </span>
          <Bell className="w-4 h-4" />
        </div>
        <div className="font-heading font-extrabold text-2xl sm:text-3xl tabular-nums mt-1">
          {countReady}
        </div>
        <span className="text-[10px] sm:text-[11px] opacity-80 block mt-0.5 truncate">
          Bisa dipanggil ulang
        </span>
      </button>
    </div>
  );
}
