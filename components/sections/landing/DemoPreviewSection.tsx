"use client";

import React, { useState } from "react";
import { landingContent } from "@/content/landing";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Smartphone,
  ChefHat,
  Monitor,
  CheckCircle2,
  Clock,
  Plus,
  ShoppingBag,
  Bell,
  Check,
} from "lucide-react";
import { DashboardMacWindow } from "@/components/molecules/DashboardMacWindow";

export function DemoPreviewSection() {
  const [activeTab, setActiveTab] = useState<"customer" | "kitchen" | "cashier">("customer");
  const { interactiveDemo } = landingContent;

  return (
    <section id="simulasi" className="bg-white py-16 lg:py-24 border-b border-[var(--line)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <Badge variant="mint" size="sm" className="mb-4">
            <span className="font-heading uppercase tracking-wider text-[11px] font-medium">
              {interactiveDemo.overline}
            </span>
          </Badge>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[40px] leading-tight tracking-tight text-zinc-950 mb-4">
            {interactiveDemo.headline}
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
            {interactiveDemo.description}
          </p>

          {/* Minimalist Segmented Control */}
          <div className="inline-flex p-1 mt-8 bg-white border border-[var(--line-strong)] rounded-full shadow-subtle">
            <button
              type="button"
              onClick={() => setActiveTab("customer")}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
                activeTab === "customer"
                  ? "bg-[var(--leaf)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-zinc-950"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>1. Menu Pelanggan (HP)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("kitchen")}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
                activeTab === "kitchen"
                  ? "bg-[var(--leaf)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-zinc-950"
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>2. Layar Dapur (KDS)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cashier")}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
                activeTab === "cashier"
                  ? "bg-[var(--leaf)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-zinc-950"
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>3. Layar Kasir Konter</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Menu Pelanggan (Mobile Preview) */}
        {activeTab === "customer" && (
          <div className="max-w-[420px] mx-auto bg-white border border-[var(--line-strong)] rounded-2xl shadow-card overflow-hidden">
            {/* Mobile Header Bar */}
            <div className="bg-[var(--leaf)] text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--mint)] block">
                  MENU ONLINE TOKO
                </span>
                <h4 className="font-heading font-semibold text-lg">Kedai Kopi Kawan</h4>
              </div>
              <Badge variant="mint" size="sm" className="bg-white/10 text-white border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--mint)] inline-block mr-1" />
                Buka
              </Badge>
            </div>

            {/* Category Filter Chips */}
            <div className="p-3 bg-[var(--surface-2)]/60 border-b border-[var(--line)] flex gap-2 overflow-x-auto text-xs font-medium">
              <span className="px-3 py-1 bg-[var(--leaf)] text-white rounded-full shrink-0">
                Semua Menu
              </span>
              <span className="px-3 py-1 bg-white text-zinc-900 border border-[var(--line)] rounded-full shrink-0">
                Makanan Berat
              </span>
              <span className="px-3 py-1 bg-white text-zinc-900 border border-[var(--line)] rounded-full shrink-0">
                Kopi & Minuman
              </span>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-3">
              <div className="border border-[var(--line)] rounded-xl p-3 flex items-center justify-between hover:border-[var(--line-strong)] transition-colors">
                <div>
                  <h5 className="font-medium text-sm text-zinc-950">Nasi Ayam Sambal Matah</h5>
                  <p className="text-xs text-[var(--muted)]">Ayam suwir rempah dengan sambal matah segar</p>
                  <span className="font-mono font-semibold text-sm text-zinc-950 block mt-1">
                    Rp 24.000
                  </span>
                </div>
                <button className="w-8 h-8 rounded-lg bg-[var(--leaf)] text-white flex items-center justify-center font-medium text-sm shrink-0 shadow-subtle hover:bg-[var(--leaf-hover)] transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="border border-[var(--line)] rounded-xl p-3 flex items-center justify-between hover:border-[var(--line-strong)] transition-colors">
                <div>
                  <h5 className="font-medium text-sm text-zinc-950">Es Kopi Susu Gula Aren</h5>
                  <p className="text-xs text-[var(--muted)]">Espresso arabika, susu segar, gula aren murni</p>
                  <span className="font-mono font-semibold text-sm text-zinc-950 block mt-1">
                    Rp 16.000
                  </span>
                </div>
                <button className="w-8 h-8 rounded-lg bg-[var(--leaf)] text-white flex items-center justify-center font-medium text-sm shrink-0 shadow-subtle hover:bg-[var(--leaf-hover)] transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="border border-[var(--line)] rounded-xl p-3 flex items-center justify-between opacity-60 bg-[var(--surface-2)]/40">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-sm text-zinc-950">Roti Bakar Coklat Keju</h5>
                    <span className="text-[10px] font-medium bg-red-100 text-red-800 px-1.5 py-0.2 rounded-full">
                      Habis
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-xs text-[var(--muted)] block mt-1">
                    Rp 15.000
                  </span>
                </div>
                <span className="text-xs font-medium text-[var(--muted)]">Tidak Tersedia</span>
              </div>
            </div>

            {/* Sticky Cart Footer Mock */}
            <div className="p-3.5 bg-white border-t border-[var(--line)] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-950">
                <div className="w-6 h-6 rounded-full bg-[var(--leaf)] text-white flex items-center justify-center text-[11px]">
                  2
                </div>
                <span>Total: Rp 40.000</span>
              </div>
              <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                <ShoppingBag className="w-3.5 h-3.5" />
                Lihat Pesanan
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Layar Dapur (KDS) */}
        {activeTab === "kitchen" && (
          <div className="max-w-[800px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Kitchen Card 1 */}
            <div className="bg-white border border-[var(--line-strong)] rounded-2xl p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-dashed border-[var(--line)] pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-medium uppercase text-[var(--muted)]">ANTRIAN</span>
                    <h4 className="font-heading font-semibold text-3xl text-zinc-950 tabular-nums tracking-tight">
                      #041
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-[var(--danger)] flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5" /> 11:24
                    </span>
                    <span className="text-[11px] font-mono text-[var(--muted)]">QRIS Lunas</span>
                  </div>
                </div>

                <div className="space-y-2 py-2">
                  <div className="flex justify-between text-sm font-medium text-zinc-950">
                    <span>2× Nasi Ayam Sambal Matah</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-zinc-950">
                    <span>2× Es Teh Manis</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--line)]">
                <Button variant="primary" size="md" className="w-full gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Tandai Siap Diambil
                </Button>
              </div>
            </div>

            {/* Kitchen Card 2 */}
            <div className="bg-white border border-[var(--line-strong)] rounded-2xl p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-dashed border-[var(--line)] pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-medium uppercase text-[var(--muted)]">ANTRIAN</span>
                    <h4 className="font-heading font-semibold text-3xl text-zinc-950 tabular-nums tracking-tight">
                      #042
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-amber-600 flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5" /> 04:10
                    </span>
                    <span className="text-[11px] font-mono text-[var(--muted)]">Tunai Lunas</span>
                  </div>
                </div>

                <div className="space-y-2 py-2">
                  <div className="flex justify-between text-sm font-medium text-zinc-950">
                    <span>1× Nasi Goreng Spesial</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-zinc-950">
                    <span>1× Es Kopi Susu Aren</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--line)]">
                <Button variant="secondary" size="md" className="w-full gap-2">
                  Mulai Masak
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Layar Kasir (Desktop macOS Showcase) */}
        {activeTab === "cashier" && (
          <div className="max-w-4xl mx-auto space-y-4">
            <DashboardMacWindow
              url="paybuy.byatara.dev/dashboard/kasir"
              title="Layar Kasir & Operasional Toko PayBuy"
            />
            <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-zinc-500 pt-2">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-[var(--leaf)]" />
                Antrian Masuk Otomatis Real-time
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-[var(--leaf)]" />
                Panggilan Suara Nomor Antrian
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-[var(--leaf)]" />
                Verifikasi Cepat Tunai & QRIS
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
