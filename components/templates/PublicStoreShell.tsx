"use client";

import * as React from "react";
import Link from "next/link";
import { Store, CreditCard, Banknote, AlertCircle, Receipt, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center selection:bg-[var(--leaf)] selection:text-white">
      {/* Mobile-first fixed container (maks. 560px per design.md 4.3) with solid forest border */}
      <div className="w-full max-w-[560px] min-h-screen bg-[var(--bg)] border-x-2 border-[var(--forest)] flex flex-col relative">
        {/* Top Header Navigation (Hijau Nota Style: 2px forest border) */}
        <header className="sticky top-0 z-30 bg-white border-b-2 border-[var(--forest)] px-4 py-3 flex items-center justify-between shadow-[0_2px_0px_var(--line)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[8px] bg-[var(--forest)] text-[var(--mint)] border-2 border-[var(--forest)] flex items-center justify-center shadow-[2px_2px_0px_var(--forest)]">
              <Receipt className="w-4 h-4 text-[var(--mint)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-base text-[var(--forest)] leading-tight">
                {storeName}
              </span>
              <span className="text-[11px] text-[var(--muted)] font-mono mt-0.5">
                /t/{storeSlug}
              </span>
            </div>
          </div>

          {/* Status Toko Badge (design.md 2.4 & 7.4: Mint selalu bertepi 2px Hutan) */}
          <div
            className={
              isOpen
                ? "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[var(--mint)] text-[var(--ink)] border-2 border-[var(--forest)] font-semibold text-xs shadow-[2px_2px_0px_var(--forest)] select-none"
                : "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[var(--amber)] text-[var(--ink)] border-2 border-[var(--forest)] font-semibold text-xs shadow-[2px_2px_0px_var(--forest)] select-none"
            }
          >
            {isOpen ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--forest)] shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-[var(--danger)] shrink-0" />
            )}
            <span>{isOpen ? "Toko Buka" : "Toko Tutup"}</span>
          </div>
        </header>

        {/* Store Closed Warning Banner (design.md 9.7) */}
        {!isOpen && (
          <div className="bg-[var(--amber)] border-b-2 border-[var(--forest)] px-4 py-3 flex items-start gap-2.5 text-xs text-[var(--ink)] font-medium">
            <AlertCircle className="w-4 h-4 text-[var(--forest)] shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block font-heading">Toko Sedang Tutup</strong>
              <span>Menu masih dapat dilihat, namun pemesanan sementara dinonaktifkan.</span>
            </div>
          </div>
        )}

        {/* Store Profile Showcase: Karcis/Nota motif card (design.md 6.1) */}
        <div className="mx-4 mt-4 bg-white border-2 border-[var(--forest)] rounded-[8px] shadow-[4px_4px_0px_var(--forest)] p-4 relative overflow-hidden">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-[8px] bg-[var(--surface-2)] border-2 border-[var(--forest)] flex items-center justify-center text-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] shrink-0">
              <Store className="w-6 h-6 text-[var(--forest)]" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg text-[var(--forest)] leading-tight">
                {storeName}
              </h1>
              <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                Pesan menu favorit kamu langsung dari meja tanpa perlu mengantre.
              </p>
            </div>
          </div>

          {/* Payment Badges Supported */}
          {(acceptQris || acceptCash) && (
            <div className="pt-3 mt-3 border-t-2 border-dashed border-[var(--line)] flex flex-col gap-2">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Metode Bayar:
              </span>
              <div className="flex items-center gap-2">
                {acceptQris && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--surface-2)] text-[var(--forest)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] text-[11px] font-semibold text-center select-none",
                      acceptCash ? "flex-1" : "flex-initial"
                    )}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[var(--leaf)] shrink-0" />
                    <span className="whitespace-nowrap">QRIS Instan</span>
                  </span>
                )}
                {acceptCash && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white text-[var(--forest)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] text-[11px] font-semibold text-center select-none",
                      acceptQris ? "flex-1" : "flex-initial"
                    )}
                  >
                    <Banknote className="w-3.5 h-3.5 text-[var(--forest)] shrink-0" />
                    <span className="whitespace-nowrap">Tunai di Kasir</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content (Category Tabs, Product List, Cart) */}
        <main className="flex-1 pb-28">{children}</main>

        {/* Authentic Hijau Nota Footer */}
        <footer className="p-5 border-t-2 border-[var(--forest)] text-center text-xs text-[var(--muted)] space-y-1 bg-white mt-auto">
          <p className="font-medium text-[var(--forest)]">
            Didukung oleh{" "}
            <Link
              href="/"
              className="font-bold underline text-[var(--leaf)] hover:text-[var(--forest)] transition-colors"
            >
              PayBuy
            </Link>{" "}
            — Kasir & Pesan Mandiri UMKM
          </p>
          <p className="text-[11px] text-[var(--muted)]">
            Pemesanan langsung tanpa aplikasi • Transaksi cepat & aman
          </p>
        </footer>
      </div>
    </div>
  );
}
