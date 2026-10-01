"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  size = "md",
  disabled = false,
  className,
}: QuantityStepperProps) {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || value <= min) return;
    onChange(value - 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || value >= max) return;
    onChange(value + 1);
  };

  const isSmall = size === "sm";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 select-none",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={cn(
          "flex items-center justify-center rounded-[6px] bg-white text-[var(--forest)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[var(--surface-2)] transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none",
          isSmall ? "w-7 h-7" : "w-8 h-8"
        )}
        aria-label="Kurangi jumlah"
      >
        <Minus className={cn(isSmall ? "w-3 h-3 stroke-[2.5]" : "w-3.5 h-3.5 stroke-[2.5]")} />
      </button>

      <span
        className={cn(
          "font-heading font-bold text-[var(--forest)] text-center tabular-nums leading-none",
          isSmall ? "w-6 text-xs" : "w-8 text-sm"
        )}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={cn(
          "flex items-center justify-center rounded-[6px] bg-[var(--leaf)] text-white border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[var(--leaf-hover)] transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none",
          isSmall ? "w-7 h-7" : "w-8 h-8"
        )}
        aria-label="Tambah jumlah"
      >
        <Plus className={cn(isSmall ? "w-3 h-3 stroke-[2.5]" : "w-3.5 h-3.5 stroke-[2.5]")} />
      </button>
    </div>
  );
}
