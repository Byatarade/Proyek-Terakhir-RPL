import React from "react";
import { ShoppingBag, CheckCircle2 } from "lucide-react";

interface StaffStatCardsProps {
  totalStaff: number;
  totalKasir: number;
}

export function StaffStatCards({ totalStaff, totalKasir }: StaffStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="p-3.5 rounded-[8px] bg-white border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Total Pengguna
        </span>
        <div className="font-heading font-extrabold text-2xl text-[var(--forest)]">
          {totalStaff}
        </div>
        <span className="text-[11px] text-[var(--muted)] block">Owner & Kasir</span>
      </div>

      <div className="p-3.5 rounded-[8px] bg-[var(--surface-2)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--leaf)] flex items-center gap-1">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Kasir Aktif</span>
        </span>
        <div className="font-heading font-extrabold text-2xl text-[var(--forest)]">
          {totalKasir}
        </div>
        <span className="text-[11px] text-[var(--muted)] block">
          Operasional & Antrian
        </span>
      </div>

      <div className="p-3.5 rounded-[8px] bg-emerald-50 border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--leaf)] flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Hak Akses</span>
        </span>
        <div className="font-heading font-extrabold text-lg text-[var(--forest)] mt-1">
          Kasir Terpadu
        </div>
        <span className="text-[11px] text-[var(--muted)] block">
          POS, Masak & Panggil
        </span>
      </div>
    </div>
  );
}
