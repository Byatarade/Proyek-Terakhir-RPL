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
        "inline-flex items-center rounded-xl bg-zinc-50 border border-zinc-200/90 select-none shadow-2xs",
        isSmall ? "h-8 px-1" : "h-10 px-1.5",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={cn(
          "flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-white active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:hover:bg-transparent",
          isSmall ? "w-6 h-6" : "w-7 h-7"
        )}
        aria-label="Kurangi jumlah"
      >
        <Minus className={cn(isSmall ? "w-3 h-3" : "w-3.5 h-3.5")} />
      </button>

      <span
        className={cn(
          "font-heading font-semibold text-zinc-950 text-center tabular-nums leading-none",
          isSmall ? "w-7 text-xs" : "w-9 text-sm"
        )}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={cn(
          "flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-white active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:hover:bg-transparent",
          isSmall ? "w-6 h-6" : "w-7 h-7"
        )}
        aria-label="Tambah jumlah"
      >
        <Plus className={cn(isSmall ? "w-3 h-3" : "w-3.5 h-3.5")} />
      </button>
    </div>
  );
}
