"use client";

import React from "react";
import Image from "next/image";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Lock, ArrowLeft, ArrowRight, RotateCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardMacWindowProps {
  className?: string;
  url?: string;
  title?: string;
}

export function DashboardMacWindow({
  className,
  url = "paybuy.web.id/dashboard/kasir",
  title = "Layar Kasir & Operasional",
}: DashboardMacWindowProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 border-zinc-200/90 bg-zinc-100 shadow-[0_20px_50px_rgba(15,61,42,0.12),0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_rgba(15,61,42,0.16)]",
        className
      )}
    >
      {/* macOS Window Title / Chrome Bar */}
      <div className="h-11 sm:h-12 px-4 bg-zinc-100/95 border-b border-zinc-200/90 flex items-center justify-between select-none">
        {/* Left: macOS Traffic Light Buttons */}
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-transform hover:scale-110 cursor-pointer"
            title="Tutup"
          />
          <span
            className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-transform hover:scale-110 cursor-pointer"
            title="Kecilkan"
          />
          <span
            className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-transform hover:scale-110 cursor-pointer"
            title="Layar Penuh"
          />

          {/* Subtitle / Controls */}
          <div className="hidden md:flex items-center gap-1.5 ml-3 text-zinc-400">
            <ArrowLeft className="w-3.5 h-3.5" />
            <ArrowRight className="w-3.5 h-3.5 opacity-40" />
            <RotateCw className="w-3 h-3 ml-0.5 opacity-60" />
          </div>
        </div>

        {/* Center: Browser Address Bar */}
        <div className="flex-1 max-w-[260px] sm:max-w-sm mx-2 sm:mx-4">
          <div className="bg-white/95 border border-zinc-200/90 rounded-lg px-3 py-1 flex items-center justify-center gap-1.5 text-xs text-zinc-600 shadow-2xs font-mono">
            <Lock className="w-3 h-3 text-[var(--leaf)] shrink-0" />
            <span className="truncate tracking-tight font-medium text-[11px] sm:text-xs">
              {url}
            </span>
          </div>
        </div>

        {/* Right: Live Status Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Live Showcase</span>
          </span>
        </div>
      </div>

      {/* Window Body: Screenshot Content */}
      <div className="relative w-full bg-white overflow-hidden group">
        <Image
          src="/images/dashboard-showcase.png"
          alt={title}
          width={1024}
          height={564}
          priority
          className="w-full h-auto object-cover object-top select-none transition-transform duration-500 group-hover:scale-[1.008]"
        />

        {/* Subtle Bottom Vignette */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/[0.04] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
