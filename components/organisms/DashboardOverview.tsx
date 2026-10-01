import React from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  QrCode,
  ExternalLink,
  ArrowRight,
  Receipt,
  Store,
  CheckCircle2,
} from "lucide-react";
import { StatCard } from "@/components/molecules/StatCard";
import { Button } from "@/components/atoms/Button";
import { formatRupiah } from "@/lib/utils";

export interface DashboardOverviewProps {
  storeName?: string;
  storeSlug: string;
  isOpen: boolean;
  role?: string;
  todaySales?: number;
  todayOrdersCount?: number;
  activeOrdersCount?: number;
}

export function DashboardOverview({
  storeSlug,
  isOpen,
  todaySales = 0,
  todayOrdersCount = 0,
  activeOrdersCount = 0,
}: DashboardOverviewProps) {
  const currentDateFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  return (
    <div className="space-y-6 sm:space-y-8 bg-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200 mb-2.5 select-none">
            <Store className="w-3.5 h-3.5 text-[var(--leaf)]" />
            <span>{currentDateFormatted} (WIB)</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-zinc-950 tracking-tight">
            Ringkasan Hari Ini
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Pantau penjualan, pesanan masuk, dan aktivitas operasional toko Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/t/${storeSlug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="md" className="gap-2 text-xs sm:text-sm">
              <span>Buka Menu Publik</span>
              <ExternalLink className="w-4 h-4 text-zinc-500" />
            </Button>
          </Link>
          <Link href="/dashboard/qr">
            <Button variant="primary" size="md" className="gap-2 text-xs sm:text-sm">
              <QrCode className="w-4 h-4" />
              <span>QR Menu Toko</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Penjualan Hari Ini"
          value={formatRupiah(todaySales)}
          subtitle="Dari seluruh pesanan lunas"
          icon={<DollarSign className="w-4 h-4 text-[var(--leaf)]" />}
        />
        <StatCard
          label="Pesanan Hari Ini"
          value={`${todayOrdersCount} Pesanan`}
          subtitle="Total pesanan masuk"
          icon={<ShoppingBag className="w-4 h-4 text-[var(--blue)]" />}
        />
        <StatCard
          label="Antrian / Pesanan Aktif"
          value={`${activeOrdersCount} Antrian`}
          subtitle="Diproses atau siap diambil"
          icon={<Clock className="w-4 h-4 text-[var(--amber)]" />}
        />
        <StatCard
          label="Status Operasional"
          value={isOpen ? "Toko Buka" : "Toko Tutup"}
          subtitle="Penerimaan pesanan aktif"
          icon={<CheckCircle2 className="w-4 h-4 text-[var(--leaf)]" />}
        />
      </div>

      {/* QR & Menu Activation Banner: Minimalist Landing Card Style */}
      <div className="bg-white border border-[var(--line)] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Ticket Notches */}
        <div className="ticket-notch-left top-1/2 -translate-y-1/2" aria-hidden="true" />
        <div className="ticket-notch-right top-1/2 -translate-y-1/2" aria-hidden="true" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[var(--leaf)] border border-emerald-200/80 text-[11px] font-semibold tracking-wide uppercase">
              1 QR Code Seumur Toko
            </div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-zinc-950">
              Menu Toko & Pemesanan Mandiri Anda Siap Digunakan
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-2xl font-normal">
              Pelanggan cukup memindai satu QR menu yang dicetak untuk melihat daftar produk, memesan langsung dari ponsel tanpa akun, dan mendapatkan nomor antrian.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-xs text-zinc-800 select-all">
                /t/{storeSlug}
              </div>
              <Link
                href={`/t/${storeSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[var(--leaf)] hover:text-[var(--leaf-hover)] transition-colors inline-flex items-center gap-1"
              >
                <span>Lihat Tampilan Menu</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 flex lg:justify-end">
            <Link href="/dashboard/qr">
              <Button variant="primary" size="md" className="w-full sm:w-auto gap-2">
                <QrCode className="w-4 h-4" />
                <span>Unduh & Cetak QR Menu</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Empty State / Overview Card */}
      <div className="bg-white border border-[var(--line)] rounded-2xl p-8 sm:p-10 text-center space-y-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-[var(--leaf)] mx-auto">
          <Receipt className="w-7 h-7" />
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="font-heading font-bold text-lg text-zinc-950">
            Belum Ada Transaksi Hari Ini
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-normal">
            Pesanan dari pelanggan yang memindai QR menu akan langsung tercatat dan diperbarui otomatis di sini, layar kasir, dan layar dapur.
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Link href="/dashboard/menu">
            <Button variant="secondary" size="md" className="gap-2 text-xs sm:text-sm">
              <span>Kelola Daftar Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
