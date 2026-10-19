import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { TransactionFilterBarProps } from "./types";

export function TransactionFilterBar({
  datePreset,
  onFilterChange,
  searchQuery,
  setSearchQuery,
  onSearch,
  selectedStatus,
  selectedPayment,
}: TransactionFilterBarProps) {
  return (
    <div className="bg-zinc-50/80 border border-[var(--line)] rounded-2xl p-4 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Quick Date Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: "all", label: "Semua Waktu" },
            { id: "today", label: "Hari Ini" },
            { id: "7days", label: "7 Hari Terakhir" },
            { id: "30days", label: "30 Hari Terakhir" },
          ].map((p) => {
            const isSelected = datePreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onFilterChange(p.id)}
                className={cn(
                  "px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all cursor-pointer border-2",
                  isSelected
                    ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] font-semibold"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <form onSubmit={onSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari antrian / token / menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)] w-48 sm:w-64"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-9 text-xs">
            Cari
          </Button>
        </form>
      </div>

      {/* Status & Payment Method Dropdowns */}
      <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium">Status Pesanan:</span>
          <select
            value={selectedStatus}
            onChange={(e) => {
              onFilterChange(datePreset, e.target.value, selectedPayment);
            }}
            className="h-8 px-2.5 rounded-[6px] border-2 border-[var(--control)] bg-white text-xs text-zinc-800 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="menunggu_bayar">Menunggu Bayar</option>
            <option value="dibayar">Sudah Dibayar</option>
            <option value="diproses">Sedang Dimasak</option>
            <option value="siap">Siap Diambil</option>
            <option value="diambil">Selesai (Diambil)</option>
            <option value="dibatalkan">Dibatalkan</option>
            <option value="kedaluwarsa">Kedaluwarsa</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium">Metode Pembayaran:</span>
          <select
            value={selectedPayment}
            onChange={(e) => {
              onFilterChange(datePreset, selectedStatus, e.target.value);
            }}
            className="h-8 px-2.5 rounded-[6px] border-2 border-[var(--control)] bg-white text-xs text-zinc-800 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Metode</option>
            <option value="cash">Tunai (Kasir)</option>
            <option value="qris">QRIS Toko</option>
          </select>
        </div>
      </div>
    </div>
  );
}
