import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[var(--line)] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-center text-zinc-700 shrink-0 group-hover:scale-105 transition-transform">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="font-heading font-bold text-2xl sm:text-[28px] text-zinc-950 tracking-tight tabular-nums leading-none">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
            {trend && (
              <span
                className={cn(
                  "font-medium px-2 py-0.5 rounded-full text-[11px]",
                  trend.isPositive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                    : "bg-red-50 text-red-700 border border-red-200/70"
                )}
              >
                {trend.value}
              </span>
            )}
            {subtitle && <span className="truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
