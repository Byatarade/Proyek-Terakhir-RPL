import React from "react";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { QrCustomizePanelProps } from "./types";

export function QrCustomizePanel({
  tableLabel,
  setTableLabel,
  qrColor,
  setQrColor,
  showSteps,
  setShowSteps,
}: QrCustomizePanelProps) {
  return (
    <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[var(--line)] shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
        <Palette className="w-4 h-4 text-[var(--leaf)]" />
        <h3 className="font-heading font-bold text-sm text-[var(--forest)]">
          Kustomisasi Tampilan Karcis
        </h3>
      </div>

      <div className="space-y-4">
        {/* Opsi Nomor Meja / Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--forest)] flex items-center justify-between">
            <span>Label Posisi / Meja:</span>
            <span className="text-[10px] font-normal text-[var(--muted)]">
              (Contoh: Meja 01, Lantai 2, Kasir Utama)
            </span>
          </label>
          <input
            type="text"
            value={tableLabel}
            onChange={(e) => setTableLabel(e.target.value)}
            placeholder="Misal: Meja 01 atau Kasir"
            className="w-full h-10 px-3.5 rounded-xl border border-[var(--line)] text-xs text-[var(--forest)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--forest)]"
          />
        </div>

        {/* Opsi Warna QR Code */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--forest)] block">
            Pilihan Warna Modul QR:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setQrColor("forest")}
              className={cn(
                "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                qrColor === "forest"
                  ? "border-2 border-[var(--forest)] bg-[var(--surface-2)] text-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                  : "border-[var(--line)] hover:bg-zinc-50 text-zinc-600"
              )}
            >
              <span className="w-4 h-4 rounded-full bg-[#0F3D2A] border border-white" />
              <span>Hijau PayBuy (Khas)</span>
            </button>

            <button
              type="button"
              onClick={() => setQrColor("black")}
              className={cn(
                "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                qrColor === "black"
                  ? "border-2 border-[var(--forest)] bg-[var(--surface-2)] text-[var(--forest)] shadow-[2px_2px_0px_var(--forest)]"
                  : "border-[var(--line)] hover:bg-zinc-50 text-zinc-600"
              )}
            >
              <span className="w-4 h-4 rounded-full bg-[#000000] border border-white" />
              <span>Hitam Standar</span>
            </button>
          </div>
        </div>

        {/* Toggle Petunjuk Langkah */}
        <div className="flex items-center justify-between pt-1">
          <label className="text-xs font-bold text-[var(--forest)] cursor-pointer">
            Tampilkan Petunjuk 3 Langkah di Karcis
          </label>
          <input
            type="checkbox"
            checked={showSteps}
            onChange={(e) => setShowSteps(e.target.checked)}
            className="w-4 h-4 accent-[var(--forest)] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
