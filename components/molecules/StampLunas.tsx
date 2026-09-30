import React from "react";
import { cn } from "@/lib/utils";

interface StampLunasProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

/**
 * Minimalist Stamp LUNAS:
 * Clean, modern verification badge with subtle angle, refined border,
 * and elegant mint background.
 */
export function StampLunas({
  className,
  size = "md",
  animate = true,
}: StampLunasProps) {
  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[11px] border",
    md: "px-3.5 py-1 text-[13px] border-[1.5px]",
    lg: "px-5 py-1.5 text-[16px] border-2",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-heading font-bold uppercase text-zinc-950 bg-[var(--mint-light)] border-[var(--leaf)] rounded-lg shadow-subtle tracking-[0.1em] select-none",
        sizeStyles[size],
        animate ? "animate-stamp" : "rotate-[-3deg]",
        className
      )}
      style={{ transformOrigin: "center center" }}
    >
      LUNAS
    </div>
  );
}
