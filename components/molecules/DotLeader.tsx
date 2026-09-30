import React from "react";
import { cn, formatRupiah } from "@/lib/utils";

interface DotLeaderProps {
  name: string;
  qty?: number;
  price: number;
  className?: string;
}

/**
 * Receipt line with dot leader (design.md Section 6.2):
 * Displays product name on left, price on right with tabular-nums,
 * connected with physical receipt dotted line.
 */
export function DotLeader({ name, qty, price, className }: DotLeaderProps) {
  return (
    <div className={cn("flex items-baseline justify-between text-[15px]", className)}>
      <span className="font-medium text-[var(--ink)] shrink-0">
        {qty && <strong className="font-bold text-zinc-950 mr-1.5">{qty}×</strong>}
        {name}
      </span>
      <span className="dot-leader" aria-hidden="true" />
      <span className="font-semibold text-[var(--ink)] tabular-nums shrink-0 font-mono">
        {formatRupiah(price)}
      </span>
    </div>
  );
}
