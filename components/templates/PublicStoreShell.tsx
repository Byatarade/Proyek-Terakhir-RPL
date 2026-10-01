"use client";

import * as React from "react";
import Link from "next/link";
import { Store, CreditCard, Banknote, AlertCircle, Receipt } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";

export interface PublicStoreShellProps {
  children: React.ReactNode;
  storeName: string;
  storeSlug: string;
  isOpen: boolean;
  acceptCash?: boolean;
  acceptQris?: boolean;
  qrisMerchantName?: string | null;
}

export function PublicStoreShell({
  children,
  storeName,
  storeSlug,
  isOpen = true,
  acceptCash = true,
  acceptQris = true,
}: PublicStoreShellProps) {
  return (
    <div className="min-h-screen bg-zinc-100/60 text-zinc-900 flex flex-col items-center selection:bg-[var(--leaf)] selection:text-white">
      {/* Mobile-first fixed container (maks. 560px per design.md 4.3) */}
      <div className="w-full max-w-[560px] min-h-screen bg-white border-x border-[var(--line)] flex flex-col shadow-xs relative">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[var(--line)] px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 text-[var(--leaf)] flex items-center justify-center shadow-2xs">
              <Receipt className="w-4 h-4 text-[var(--leaf)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-base text-zinc-950 leading-none">
                {storeName}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                /t/{storeSlug}
              </span>
            </div>
          </div>

          <Badge
            variant={isOpen ? "mint" : "neutral"}
            size="sm"
            className="font-semibold text-xs"
          >
            {isOpen ? "Toko Buka" : "Toko Sedang Tutup"}
          </Badge>
        </header>

        {/* Store Closed Warning Banner (design.md 9.7) */}
        {!isOpen && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Toko Sedang Tutup</strong>
              <span>Menu masih dapat dilihat, namun pemesanan sementara dinonaktifkan.</span>
            </div>
          </div>
        )}

        {/* Store Profile Showcase Card */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] bg-zinc-50/50 space-y-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200/80 flex items-center justify-center text-[var(--leaf)] shadow-2xs shrink-0">
              <Store className="w-6 h-6 text-[var(--leaf)]" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-zinc-950 leading-tight">
                {storeName}
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Pesan menu favorit Anda langsung dari meja tanpa perlu mengantre.
              </p>
            </div>
          </div>

          {/* Payment Badges Supported */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-medium text-zinc-400">Metode Bayar:</span>
            {acceptQris && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[var(--leaf)] border border-emerald-200/80 text-[11px] font-semibold">
                <CreditCard className="w-3 h-3" />
                <span>QRIS Instan</span>
              </span>
            )}
            {acceptCash && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 text-[11px] font-semibold">
                <Banknote className="w-3 h-3" />
                <span>Tunai di Kasir</span>
              </span>
            )}
          </div>
        </div>

        {/* Main Content (Category Tabs, Product List, Cart) */}
        <main className="flex-1 pb-24">{children}</main>

        {/* Minimalist Public Store Footer */}
        <footer className="p-6 border-t border-[var(--line)] text-center text-xs text-zinc-400 space-y-1 bg-white">
          <p className="font-medium text-zinc-500">
            Didukung oleh{" "}
            <Link href="/" className="font-semibold text-zinc-800 hover:text-[var(--leaf)] transition-colors">
              PayBuy
            </Link>{" "}
            — Kasir & Pesan Mandiri UMKM
          </p>
          <p className="text-[11px] text-zinc-400">
            Pemesanan langsung tanpa aplikasi • Transaksi cepat & aman
          </p>
        </footer>
      </div>
    </div>
  );
}
