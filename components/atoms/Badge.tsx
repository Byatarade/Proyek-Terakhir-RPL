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
  // Minimalist Landing Page Style: Pill-shaped, subtle 1px border, refined soft background
  const baseStyles =
    "inline-flex items-center gap-1.5 font-medium rounded-full transition-colors select-none";

  const sizeStyles = {
    sm: "h-6 px-2.5 text-[11px]",
    md: "h-7 px-3 text-[12px]",
  };

  const variantStyles = {
    mint: "bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium",
    forest: "bg-zinc-950 text-white border border-zinc-950",
    leaf: "bg-emerald-50 text-[var(--leaf)] border border-emerald-200/80 font-medium",
    amber: "bg-amber-50 text-amber-800 border border-amber-200/80",
    neutral: "bg-zinc-100 text-zinc-700 border border-zinc-200/80",
    danger: "bg-red-50 text-[var(--danger)] border border-red-200/80",
    blue: "bg-blue-50 text-[var(--blue)] border border-blue-200/80",
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
