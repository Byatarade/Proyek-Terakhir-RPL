import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "xl";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Minimalist: Clean 10px rounded, smooth transitions, subtle micro-elevation
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)]/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer btn-minimal";

    const variantStyles = {
      // Primary: Vibrant Bright Green (Emerald 500) with clean soft shadow
      primary:
        "bg-[var(--leaf)] hover:bg-[var(--leaf-hover)] text-white shadow-subtle hover:shadow-card font-semibold",
      // Secondary: Crisp white with fine subtle border and clean black text
      secondary:
        "bg-white hover:bg-[var(--surface-2)] text-zinc-900 border border-[var(--line-strong)] shadow-subtle hover:border-zinc-400 hover:text-black",
      // Danger: Clean red with soft shadow
      danger:
        "bg-[var(--danger)] hover:bg-[var(--danger-hover)] text-white shadow-subtle",
      // Ghost: Clean black text with light hover
      ghost:
        "bg-transparent hover:bg-[var(--surface-2)] text-zinc-900 hover:text-black",
      // Link: Clean text link
      link:
        "bg-transparent text-[var(--leaf)] hover:underline p-0 h-auto",
    };

    const sizeStyles = {
      sm: "h-9 px-3.5 text-xs font-semibold",
      md: "h-11 px-5 text-sm font-semibold",
      lg: "h-12 px-6 text-base font-semibold",
      xl: "h-14 px-8 text-base sm:text-lg font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
