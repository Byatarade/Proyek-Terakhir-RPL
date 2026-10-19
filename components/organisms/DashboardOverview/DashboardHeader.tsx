import React from "react";
import Link from "next/link";
import { Store, ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { DashboardHeaderProps } from "./types";

export function DashboardHeader({
  storeName,
  storeSlug,
  currentDateFormatted,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 px-3 py-1 rounded-[6px] border border-zinc-200 mb-2 select-none">
          <Store className="w-3.5 h-3.5 text-[var(--leaf)]" />
          <span>{currentDateFormatted} (WIB)</span>
        </div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-zinc-950 tracking-tight">
          Beranda Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Pantau penjualan, rekapitulasi laba rugi, pesanan masuk, dan operasional toko {storeName}.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <Link href={`/t/${storeSlug}`} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" size="md" className="gap-2 text-xs sm:text-sm">
            <span>Menu Pelanggan</span>
            <ExternalLink className="w-4 h-4 text-zinc-500" />
          </Button>
        </Link>
        <Link href="/dashboard/qr">
          <Button variant="primary" size="md" className="gap-2 text-xs sm:text-sm">
            <QrCode className="w-4 h-4" />
            <span>QR Menu</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
