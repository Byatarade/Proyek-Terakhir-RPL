import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "mint" | "forest" | "leaf" | "amber" | "neutral" | "danger" | "blue";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "mint",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  // Hijau Nota Style (design.md 7.4): Radius 6px, border tegas, kontras tinggi
  const baseStyles =
    "inline-flex items-center gap-1.5 font-medium rounded-[6px] transition-colors select-none";

  const sizeStyles = {
    sm: "h-6 px-2 text-[11px]",
    md: "h-7 px-2.5 text-[12px]",
  };

  const variantStyles = {
    // Mint di atas putih kontrasnya rendah, jadi wajib diberi garis tepi Hutan (design.md 2.4 & 7.4)
    mint: "bg-[var(--mint)] text-[var(--ink)] border-2 border-[var(--forest)] font-medium",
    forest: "bg-[var(--forest)] text-white border-2 border-[var(--forest)] font-medium",
    leaf: "bg-[var(--surface-2)] text-[var(--leaf)] border-2 border-[var(--leaf)] font-medium",
    amber: "bg-[var(--amber)] text-[var(--ink)] border-2 border-[var(--forest)] font-medium",
    neutral: "bg-[var(--surface-2)] text-[var(--forest)] border-2 border-[var(--line)] font-medium",
    danger: "bg-[var(--danger)] text-white border-2 border-[#7C2011] font-medium",
    blue: "bg-[var(--blue)] text-white border-2 border-[var(--forest)] font-medium",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
