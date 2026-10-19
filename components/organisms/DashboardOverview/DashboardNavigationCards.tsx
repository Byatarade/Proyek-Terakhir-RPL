import React from "react";
import Link from "next/link";
import { ShoppingBag, Clock, BarChart3, ArrowRight } from "lucide-react";

export function DashboardNavigationCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Kasir POS */}
      <Link
        href="/dashboard/pos"
        className="bg-white border border-[var(--line)] rounded-2xl p-5 shadow-xs hover:border-[var(--forest)] hover:shadow-md transition-all group flex flex-col justify-between"
      >
        <div className="space-y-1.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800 mb-2">
            <ShoppingBag className="w-4 h-4 text-[var(--leaf)]" />
          </div>
          <h3 className="font-heading font-bold text-base text-zinc-950 group-hover:text-[var(--leaf)] transition-colors">
            Kasir POS (Input Menu)
          </h3>
          <p className="text-xs text-zinc-500 font-normal">
            Input pesanan manual pelanggan yang memesan langsung di meja kasir.
          </p>
        </div>
        <div className="pt-4 flex items-center text-xs font-semibold text-[var(--leaf)] gap-1">
          <span>Buka Kasir POS</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* Riwayat Transaksi */}
      <Link
        href="/dashboard/transaksi"
        className="bg-white border border-[var(--line)] rounded-2xl p-5 shadow-xs hover:border-[var(--forest)] hover:shadow-md transition-all group flex flex-col justify-between"
      >
        <div className="space-y-1.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800 mb-2">
            <Clock className="w-4 h-4 text-[var(--blue)]" />
          </div>
          <h3 className="font-heading font-bold text-base text-zinc-950 group-hover:text-[var(--blue)] transition-colors">
            Riwayat Transaksi
          </h3>
          <p className="text-xs text-zinc-500 font-normal">
            Daftar seluruh pesanan masuk, nota nomor antrian, dan status pembayaran pelanggan.
          </p>
        </div>
        <div className="pt-4 flex items-center text-xs font-semibold text-[var(--blue)] gap-1">
          <span>Buka Riwayat Transaksi</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* Laba Rugi & Biaya Detail */}
      <Link
        href="/dashboard/laporan"
        className="bg-white border border-[var(--line)] rounded-2xl p-5 shadow-xs hover:border-[var(--forest)] hover:shadow-md transition-all group flex flex-col justify-between"
      >
        <div className="space-y-1.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--forest)] mb-2">
            <BarChart3 className="w-4 h-4 text-[var(--leaf)]" />
          </div>
          <h3 className="font-heading font-bold text-base text-zinc-950 group-hover:text-[var(--forest)] transition-colors">
            Laporan Finansial Lengkap
          </h3>
          <p className="text-xs text-zinc-500 font-normal">
            Analisis mendalam laba rugi, rincian biaya per kategori, dan ekspor laporan keuangan.
          </p>
        </div>
        <div className="pt-4 flex items-center text-xs font-semibold text-[var(--forest)] gap-1">
          <span>Buka Laporan Detail</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  );
}
