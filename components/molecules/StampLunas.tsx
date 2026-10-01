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
    sm: "px-2.5 py-0.5 text-[11px] border-2",
    md: "px-3.5 py-1 text-[13px] border-3",
    lg: "px-5 py-1.5 text-[16px] border-3",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-heading font-semibold uppercase text-[var(--forest)] bg-[var(--mint)] border-[var(--forest)] rounded-[8px] shadow-[2px_2px_0px_var(--forest)] tracking-[0.12em] select-none",
        sizeStyles[size],
        animate ? "animate-stamp" : "rotate-[-4deg]",
        className
      )}
      style={{ transformOrigin: "center center" }}
    >
      LUNAS
    </div>
  );
}
