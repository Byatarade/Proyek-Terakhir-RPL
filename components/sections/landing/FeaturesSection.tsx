import React from "react";
import { landingContent } from "@/content/landing";
import { Badge } from "@/components/atoms/Badge";
import {
  QrCode,
  TrendingUp,
  Download,
  Layers,
} from "lucide-react";

export function FeaturesSection() {
  const { features } = landingContent;

  return (
    <section id="fitur" className="bg-white py-16 lg:py-24 border-b border-[var(--line)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <Badge variant="mint" size="sm" className="mb-4">
            <Layers className="w-3.5 h-3.5 text-[var(--leaf)]" />
            <span className="font-heading uppercase tracking-wider text-[11px] font-medium">
              {features.overline}
            </span>
          </Badge>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[40px] leading-tight tracking-tight text-zinc-950 mb-4">
            {features.headline}
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
            {features.description}
          </p>
        </div>

        {/* Minimalist Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Card 1: 1 QR Seumur Toko (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[var(--line-strong)]/70 rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--leaf)] border border-emerald-200/80 px-2.5 py-0.5 rounded-full bg-emerald-50">
                  Katalog & Menu
                </span>
                <span className="text-xs font-medium text-zinc-500 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 text-[var(--leaf)]" />
                  Format PNG & SVG
                </span>
              </div>
              <h3 className="font-heading font-semibold text-2xl text-zinc-950 mb-2.5">
                Satu QR Code Seumur Toko
              </h3>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-6">
                Cukup cetak satu stiker QR untuk meja atau konter kasir Anda. Tambah menu baru, ubah harga, atau tandai stok habis kapan saja — QR yang sudah tertempel di toko tidak pernah perlu diganti.
              </p>
            </div>

            {/* Visual Preview Box (Minimalist) */}
            <div className="bg-[var(--surface-2)]/60 border border-[var(--line-strong)] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border border-[var(--line)] rounded-xl p-2 flex flex-col items-center justify-center shrink-0 shadow-subtle">
                <QrCode className="w-full h-full text-zinc-900" />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  TAUTAN RESMI MENU ANDA
                </span>
                <div className="font-mono font-medium text-sm text-zinc-950 bg-white px-3 py-1 rounded-lg border border-[var(--line)] shadow-subtle">
                  paybuy.byatara.dev/t/kopi-kawan
                </div>
                <p className="text-xs text-zinc-500 font-normal pt-0.5">
                  Siap dicetak untuk tent card meja, stiker, dan poster kasir
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Layar Dapur Otomatis (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[var(--line-strong)]/70 rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--brick)] border border-orange-200/80 px-2.5 py-0.5 rounded-full bg-orange-50">
                  Operasional Dapur
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--leaf)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--leaf)] animate-pulse" />
                  Realtime Sync
                </span>
              </div>
              <h3 className="font-heading font-semibold text-2xl text-zinc-950 mb-2.5">
                Layar Dapur Waktu Nyata (KDS)
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                Pesanan lunas seketika muncul di tablet atau HP dapur tanpa refresh. Koki tahu persis apa yang harus dimasak dan menandainya siap dalam satu sentuhan.
              </p>
            </div>

            {/* Visual KDS Ticket Mini (Clean Slate) */}
            <div className="bg-zinc-950 text-white border border-zinc-800 rounded-xl p-4 shadow-card">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3">
                <span className="font-heading font-semibold text-2xl text-[var(--mint)] tabular-nums tracking-tight">
                  Antrian #043
                </span>
                <span className="text-[11px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium px-2 py-0.5 rounded-full">
                  Diproses (03:12)
                </span>
              </div>
              <p className="text-xs font-medium text-zinc-300 mb-3">
                2× Nasi Goreng Spesial • 1× Es Teh Manis
              </p>
              <div>
                <div className="w-full text-center text-xs font-medium py-2 bg-[var(--leaf)] text-white rounded-lg hover:bg-[var(--leaf-hover)] transition-colors cursor-pointer shadow-sm">
                  Tandai Siap Diambil
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: QRIS Dinamis Otomatis (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[var(--line-strong)]/70 rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--leaf)] border border-emerald-200/80 px-2.5 py-0.5 rounded-full bg-emerald-50">
                  Pembayaran Pintar
                </span>
                <span className="text-xs text-zinc-500 font-medium">Bebas Salah Ketik</span>
              </div>
              <h3 className="font-heading font-semibold text-2xl text-zinc-950 mb-2.5">
                QRIS Dinamis Otomatis
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                Unggah QRIS toko Anda saat pendaftaran. Sistem akan mengubahnya menjadi QRIS dinamis dengan nominal otomatis. Pelanggan tinggal scan dan bayar tanpa risiko salah transfer.
              </p>
            </div>

            {/* Visual QRIS Mini (Minimalist) */}
            <div className="bg-[var(--surface-2)]/60 border border-[var(--line-strong)] rounded-xl p-4 text-center">
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 block">
                TOTAL OTOMATIS TERISI
              </span>
              <div className="font-heading font-semibold text-2xl text-zinc-950 my-1 tabular-nums tracking-tight">
                Rp 52.000
              </div>
              <span className="text-xs text-[var(--leaf)] font-medium block">
                ✓ Checksum & nama merchant terverifikasi
              </span>
            </div>
          </div>

          {/* Card 4: Laporan Laba Rugi & HPP Bersih (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[var(--line-strong)]/70 rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-700 border border-[var(--line)] px-2.5 py-0.5 rounded-full bg-[var(--surface-2)]">
                  Keuangan Riil
                </span>
                <span className="text-xs font-medium text-[var(--leaf)] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Kalkulasi Otomatis
                </span>
              </div>
              <h3 className="font-heading font-semibold text-2xl text-zinc-950 mb-2.5">
                Laporan Laba Rugi & HPP Akurat
              </h3>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-6">
                Bukan cuma mencatat omzet kotor! Sistem menyalin harga modal (HPP) setiap menu pada saat transaksi terjadi. Anda tahu persis berapa keuntungan kotor, pengeluaran operasional, dan laba bersih riil.
              </p>
            </div>

            {/* Visual Profit & Loss Breakdown Box (Minimalist) */}
            <div className="bg-[var(--surface-2)]/60 border border-[var(--line-strong)] rounded-xl p-4 sm:p-5 space-y-2 text-sm">
              <div className="flex justify-between items-center text-zinc-900">
                <span className="font-medium text-xs sm:text-sm">Total Penjualan (Omzet)</span>
                <span className="font-semibold tabular-nums">Rp 8.400.000</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500 text-xs">
                <span>Harga Pokok Penjualan (Modal Bahan)</span>
                <span className="tabular-nums">- Rp 4.200.000</span>
              </div>
              <div className="flex justify-between items-center text-zinc-900 font-medium border-t border-[var(--line)] pt-1 text-xs">
                <span>Laba Kotor</span>
                <span className="tabular-nums">Rp 4.200.000</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500 text-xs">
                <span>Pengeluaran Operasional (Gas, Kemasan, Es)</span>
                <span className="tabular-nums">- Rp 850.000</span>
              </div>
              <div className="flex justify-between items-center text-[var(--leaf)] font-heading font-semibold text-sm sm:text-base border-t border-[var(--line-strong)] pt-2">
                <span>Laba Bersih Riil Toko</span>
                <span className="tabular-nums text-base sm:text-lg">Rp 3.350.000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
