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
        "bg-white border border-[var(--line)] rounded-xl p-5 shadow-subtle flex flex-col justify-between transition-all duration-200 hover:shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[var(--forest)] shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="font-heading font-semibold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight tabular-nums">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            {trend && (
              <span
                className={cn(
                  "font-medium px-1.5 py-0.5 rounded text-[11px]",
                  trend.isPositive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-zinc-100 text-zinc-700 border border-zinc-200"
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
