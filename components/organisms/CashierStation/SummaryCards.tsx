"use client";

import React from "react";
import {
  Banknote,
  ShoppingBag,
  Utensils,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/utils";

export type ActiveTab =
  | "all_active"
  | "menunggu_bayar"
  | "siap"
  | "dapur"
  | "selesai";

export interface StatsData {
  waitingCount: number;
  waitingTotal: number;
  readyCount: number;
  kitchenCount: number;
  completedCount: number;
}

interface SummaryCardsProps {
  stats: StatsData;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

/**
 * SummaryCards — 4 kartu ringkasan statistik kasir yang berfungsi
 * sekaligus sebagai tombol filter tab (klik kartu = ganti tab aktif).
 */
export function SummaryCards({
  stats,
  activeTab,
  onTabChange,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Menunggu Bayar */}
      <div
        onClick={() => onTabChange("menunggu_bayar")}
        className={cn(
          "p-4 rounded-xl border-2 cursor-pointer transition-all bg-white",
          activeTab === "menunggu_bayar"
            ? "border-[var(--amber)] shadow-[4px_4px_0px_var(--amber)] ring-1 ring-[var(--amber)]"
            : "border-[var(--line)] hover:border-zinc-400 shadow-2xs"
        )}
      >
        <div className="flex items-center justify-between text-amber-700 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Menunggu Bayar
          </span>
          <Banknote className="w-4 h-4" />
        </div>
        <div className="font-heading font-extrabold text-2xl text-zinc-950">
          {stats.waitingCount}{" "}
          <span className="text-xs font-normal text-zinc-500">Antrian</span>
        </div>
        <div className="text-xs font-semibold text-amber-800 tabular-nums mt-0.5">
          {formatRupiah(stats.waitingTotal)}
        </div>
      </div>

      {/* Siap Diambil */}
      <div
        onClick={() => onTabChange("siap")}
        className={cn(
          "p-4 rounded-xl border-2 cursor-pointer transition-all bg-white",
          activeTab === "siap"
            ? "border-[var(--leaf)] shadow-[4px_4px_0px_var(--forest)] ring-1 ring-[var(--forest)]"
            : "border-[var(--line)] hover:border-zinc-400 shadow-2xs"
        )}
      >
        <div className="flex items-center justify-between text-[var(--leaf)] mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Siap Diambil
          </span>
          <ShoppingBag className="w-4 h-4" />
        </div>
        <div className="font-heading font-extrabold text-2xl text-zinc-950">
          {stats.readyCount}{" "}
          <span className="text-xs font-normal text-zinc-500">Pesanan</span>
        </div>
        <div className="text-xs text-[var(--muted)] mt-0.5">
          Siap dipanggil ke meja kasir
        </div>
      </div>

      {/* Sedang Dimasak */}
      <div
        onClick={() => onTabChange("dapur")}
        className={cn(
          "p-4 rounded-xl border-2 cursor-pointer transition-all bg-white",
          activeTab === "dapur"
            ? "border-[var(--blue)] shadow-[4px_4px_0px_var(--blue)] ring-1 ring-[var(--blue)]"
            : "border-[var(--line)] hover:border-zinc-400 shadow-2xs"
        )}
      >
        <div className="flex items-center justify-between text-[var(--blue)] mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Sedang Dimasak
          </span>
          <Utensils className="w-4 h-4" />
        </div>
        <div className="font-heading font-extrabold text-2xl text-zinc-950">
          {stats.kitchenCount}{" "}
          <span className="text-xs font-normal text-zinc-500">Pesanan</span>
        </div>
        <div className="text-xs text-[var(--muted)] mt-0.5">
          Sedang dimasak di dapur
        </div>
      </div>

      {/* Selesai Hari Ini */}
      <div
        onClick={() => onTabChange("selesai")}
        className={cn(
          "p-4 rounded-xl border-2 cursor-pointer transition-all bg-white",
          activeTab === "selesai"
            ? "border-[var(--forest)] shadow-[4px_4px_0px_var(--forest)] ring-1 ring-[var(--forest)]"
            : "border-[var(--line)] hover:border-zinc-400 shadow-2xs"
        )}
      >
        <div className="flex items-center justify-between text-zinc-600 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Selesai Hari Ini
          </span>
          <CheckCircle2 className="w-4 h-4 text-[var(--leaf)]" />
        </div>
        <div className="font-heading font-extrabold text-2xl text-zinc-950">
          {stats.completedCount}{" "}
          <span className="text-xs font-normal text-zinc-500">Diambil</span>
        </div>
        <div className="text-xs text-[var(--muted)] mt-0.5">
          Riwayat transaksi sukses
        </div>
      </div>
    </div>
  );
}
