import React from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse select-none" aria-busy="true" aria-label="Memuat data...">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[var(--line)] pb-5">
        <div className="space-y-2">
          <div className="h-7 w-48 sm:w-64 bg-[var(--surface-2)] rounded-[6px] border border-[var(--forest)]/20" />
          <div className="h-4 w-64 sm:w-96 bg-zinc-100 rounded-[4px]" />
        </div>
        <div className="h-10 w-36 bg-[var(--surface-2)] rounded-[6px] border border-[var(--forest)]/20 shrink-0" />
      </div>

      {/* 2. Top Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-[8px] bg-white border-2 border-[var(--line)] space-y-2.5 shadow-[2px_2px_0px_var(--line)]"
          >
            <div className="h-3 w-20 bg-zinc-100 rounded-[4px]" />
            <div className="h-7 w-16 bg-[var(--surface-2)] rounded-[4px]" />
            <div className="h-2.5 w-24 bg-zinc-100 rounded-[4px]" />
          </div>
        ))}
      </div>

      {/* 3. Main Content Skeleton (Card & Table Placeholder) */}
      <div className="rounded-[8px] bg-white border-2 border-[var(--forest)]/40 p-5 sm:p-6 space-y-4 shadow-[3px_3px_0px_var(--forest)]/20 min-h-[320px] flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <div className="h-5 w-40 bg-[var(--surface-2)] rounded-[4px]" />
          <div className="h-8 w-28 bg-zinc-100 rounded-[6px]" />
        </div>

        <div className="space-y-3 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 w-full bg-zinc-50 rounded-[6px] border border-[var(--line)] flex items-center px-4 justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--surface-2)]" />
                <div className="h-3.5 w-32 sm:w-48 bg-zinc-200 rounded" />
              </div>
              <div className="h-4 w-16 sm:w-24 bg-zinc-200 rounded" />
            </div>
          ))}
        </div>

        {/* Loading Spinner Indicator */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs font-heading font-bold text-[var(--forest)]">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--leaf)]" />
          <span>Memuat data halaman...</span>
        </div>
      </div>
    </div>
  );
}
