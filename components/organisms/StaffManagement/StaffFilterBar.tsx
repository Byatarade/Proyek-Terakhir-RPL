import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffFilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  filterRole: string;
  onFilterRoleChange: (r: string) => void;
}

const ROLE_FILTERS = [
  { key: "all", label: "Semua" },
  { key: "owner", label: "Owner" },
  { key: "kasir", label: "Kasir" },
];

export function StaffFilterBar({
  searchQuery,
  onSearchQueryChange,
  filterRole,
  onFilterRoleChange,
}: StaffFilterBarProps) {
  return (
    <div className="p-4 rounded-[8px] bg-[var(--surface-2)] border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="relative w-full sm:w-72">
        <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Cari nama atau email..."
          className="w-full pl-9 pr-3 py-2 rounded-[6px] border-2 border-[var(--forest)] bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mint)] shadow-[1px_1px_0px_var(--forest)]"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto select-none">
        <span className="text-[11px] font-bold text-[var(--forest)] uppercase tracking-wider shrink-0">
          Peran:
        </span>
        <div className="flex gap-1.5 shrink-0">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => onFilterRoleChange(r.key)}
              className={cn(
                "px-2.5 py-1 rounded-[6px] text-xs font-bold transition-all border-2 cursor-pointer select-none",
                filterRole === r.key
                  ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-[1px_1px_0px_var(--forest)]"
                  : "bg-white text-[var(--forest)] border-[var(--forest)] hover:bg-zinc-100"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
