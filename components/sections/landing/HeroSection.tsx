import React from "react";
import Link from "next/link";
import { landingContent } from "@/content/landing";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { DotLeader } from "@/components/molecules/DotLeader";
import { StampLunas } from "@/components/molecules/StampLunas";
import { TicketCard, TicketPerforation } from "@/components/molecules/TicketCard";
import { formatRupiah } from "@/lib/utils";
import { ArrowRight, CheckCircle2, QrCode, Clock, Check } from "lucide-react";
import { DashboardMacWindow } from "@/components/molecules/DashboardMacWindow";

export function HeroSection() {
  const { hero } = landingContent;
  const { sampleReceipt } = hero;

  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[var(--line)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Copywriting & CTAs - 7 cols */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Display Headline */}
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-[52px] lg:leading-[1.12] tracking-tight text-zinc-950">
              {hero.headline}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-[18px] leading-relaxed text-zinc-600 max-w-2xl font-normal">
              {hero.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <Link href={hero.primaryCta.href}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2.5 text-base shadow-card">
                  {hero.primaryCta.text}
                  <ArrowRight className="w-4 h-4 text-white" />
                </Button>
              </Link>
              <a href={hero.secondaryCta.href}>
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base">
                  {hero.secondaryCta.text}
                </Button>
              </a>
            </div>

            {/* Value Trust Points */}
            <div className="pt-4 border-t border-[var(--line)] flex flex-wrap gap-y-2.5 gap-x-6">
              {hero.trustPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-800">
                  <div className="w-4 h-4 rounded-full bg-[var(--mint-light)] text-[var(--leaf)] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                  </div>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Minimalist Receipt Card - 5 cols */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[420px] relative">
              {/* Minimalist Top Tag */}
              <div className="absolute -top-3 left-6 z-20">
                <span className="bg-zinc-950 text-white text-[11px] font-medium tracking-wide px-3 py-0.5 rounded-full shadow-subtle">
                  Simulasi Nota Fisik
                </span>
              </div>

              {/* Physical Receipt Ticket (Minimalist) */}
              <TicketCard className="p-6 pt-7 sm:p-7 bg-white">
                {/* Header Ticket: Store Name & Meta */}
                <div className="flex items-start justify-between border-b border-[var(--line)] pb-4">
                  <div>
                    <span className="text-[10px] font-medium text-zinc-400 tracking-wider uppercase">
                      TOKO MITRA
                    </span>
                    <h3 className="font-heading font-semibold text-xl text-zinc-950">
                      {sampleReceipt.storeName}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {sampleReceipt.orderDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-400 block">
                      #PB-0942
                    </span>
                    <Badge variant="mint" size="sm" className="mt-1">
                      <CheckCircle2 className="w-3 h-3 text-[var(--leaf)]" />
                      {sampleReceipt.status}
                    </Badge>
                  </div>
                </div>

                {/* Queue Number Minimal Box */}
                <div className="my-4 bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 block">
                    NOMOR ANTRIAN
                  </span>
                  <div className="font-heading font-semibold text-5xl text-zinc-950 my-1 tabular-nums tracking-tight">
                    {sampleReceipt.queueNumber}
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Simpan nomor ini untuk mengambil pesanan di konter
                  </span>
                </div>

                {/* Perforation 1 */}
                <TicketPerforation />

                {/* Order Items with Dot Leader */}
                <div className="space-y-3 py-1">
                  <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    Rincian Pesanan
                  </div>
                  {sampleReceipt.items.map((item, idx) => (
                    <DotLeader
                      key={idx}
                      qty={item.qty}
                      name={item.name}
                      price={item.price}
                    />
                  ))}
                </div>

                {/* Perforation 2 */}
                <TicketPerforation />

                {/* Total and LUNAS Stamp */}
                <div className="relative pt-2 pb-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 block">
                        TOTAL DIBAYAR
                      </span>
                      <span className="font-heading font-semibold text-2xl sm:text-3xl text-zinc-950 tabular-nums">
                        {formatRupiah(sampleReceipt.total)}
                      </span>
                    </div>

                    {/* Stamp LUNAS */}
                    <div className="relative z-10">
                      <StampLunas size="md" animate={true} />
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs text-zinc-600">
                    <span className="flex items-center gap-1.5 font-medium text-zinc-900">
                      <QrCode className="w-3.5 h-3.5 text-[var(--leaf)]" />
                      {sampleReceipt.paymentMethod}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--leaf)] font-medium">
                      VERIFIKASI SUKSES
                    </span>
                  </div>
                </div>
              </TicketCard>
            </div>
          </div>
        </div>

        {/* Showcase Dashboard macOS Window */}
        <div className="mt-14 sm:mt-20 pt-10 border-t border-[var(--line)]">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--leaf)] block">
              SHOWCASE DASHBOARD KASIR & OPERASIONAL
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-zinc-950 tracking-tight">
              Satu Layar untuk Seluruh Kendali Toko
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
              Pantau antrian pesanan, konfirmasi pembayaran kasir, dan sinkronisasi pesanan ke dapur secara langsung tanpa perlu aplikasi tambahan.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-4/5 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none -z-10" />

            {/* macOS Window with Red, Yellow, Green Buttons */}
            <DashboardMacWindow />

            {/* Feature Trust Points below the Mac Window */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-y-2.5 gap-x-8 text-xs sm:text-sm text-zinc-600">
              <span className="inline-flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[var(--leaf)] shrink-0" />
                Pemanggilan Antrian Terhubung Layar TV
              </span>
              <span className="inline-flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[var(--leaf)] shrink-0" />
                Mendukung Pembayaran QRIS Dinamis & Tunai
              </span>
              <span className="inline-flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[var(--leaf)] shrink-0" />
                Terhubung Otomatis ke Layar Monitor Dapur
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
