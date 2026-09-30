import React from "react";
import { cn } from "@/lib/utils";

interface QueueBoxProps {
  number: string;
  storeName?: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Minimalist QueueBox:
 * Clean, soft container with prominent tabular queue number.
 */
export function QueueBox({
  number,
  storeName,
  label = "NOMOR ANTRIAN",
  className,
  size = "md",
}: QueueBoxProps) {
  const numberSizes = {
    sm: "text-2xl leading-none my-1",
    md: "text-4xl md:text-5xl leading-none my-1.5",
    lg: "text-6xl md:text-7xl leading-none my-2",
  };

  return (
    <div
      className={cn(
        "bg-[var(--surface-2)]/70 border border-[var(--line-strong)] rounded-xl p-4 text-center",
        className
      )}
    >
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
      <div
        className={cn(
          "font-heading font-extrabold text-zinc-950 tabular-nums tracking-tight",
          numberSizes[size]
        )}
      >
        {number}
      </div>
      {storeName && (
        <span className="block text-xs font-medium text-[var(--muted)] mt-1 truncate">
          {storeName}
        </span>
      )}
    </div>
  );
}
