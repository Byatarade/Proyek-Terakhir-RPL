import React from "react";
import { Calendar, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

interface PeriodFilterBarProps {
  activePreset: string;
  showCustomDate: boolean;
  onToggleCustomDate: () => void;
  onApplyPreset: (preset: string) => void;
  customStart: string;
  onCustomStartChange: (val: string) => void;
  customEnd: string;
  onCustomEndChange: (val: string) => void;
  onApplyCustomRange: (e: React.FormEvent) => void;
  isPending: boolean;
}

const PRESETS = [
  { id: "today", label: "Hari Ini" },
  { id: "7days", label: "7 Hari Terakhir" },
  { id: "30days", label: "30 Hari Terakhir" },
  { id: "thisMonth", label: "Bulan Ini" },
  { id: "lastMonth", label: "Bulan Lalu" },
];

export function PeriodFilterBar({
  activePreset,
  showCustomDate,
  onToggleCustomDate,
  onApplyPreset,
  customStart,
  onCustomStartChange,
  customEnd,
  onCustomEndChange,
  onApplyCustomRange,
  isPending,
}: PeriodFilterBarProps) {
  return (
    <div className="bg-zinc-50/80 border border-[var(--line)] rounded-2xl p-3.5 sm:p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
          <Calendar className="w-4 h-4 text-[var(--leaf)]" />
          <span>Periode Laporan:</span>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200 overflow-x-auto scrollbar-none">
          {PRESETS.map((p) => {
            const isSelected = activePreset === p.id && !showCustomDate;
            return (
              <button
                key={p.id}
                onClick={() => onApplyPreset(p.id)}
                disabled={isPending}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0",
                  isSelected
                    ? "bg-white text-[var(--forest)] shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
                )}
              >
                {p.label}
              </button>
            );
          })}

          <button
            onClick={onToggleCustomDate}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5",
              activePreset === "custom" || showCustomDate
                ? "bg-white text-[var(--forest)] shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Filter className="w-3 h-3" />
            <span>Kustom Tanggal</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Accordion */}
      {showCustomDate && (
        <form
          onSubmit={onApplyCustomRange}
          className="pt-3 mt-2 border-t border-zinc-200/80 flex flex-wrap items-center gap-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Dari:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              className="h-9 px-2.5 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Sampai:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              className="h-9 px-2.5 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)]"
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isPending}
            className="text-xs h-9"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Terapkan Rentang"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
