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
    // Hijau Nota Style (design.md 7.1): Solid, 8px radius, 2px border, hard shadow, active physical press
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-[8px] transition-all select-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--leaf)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantStyles = {
      // Primary: Hijau Daun, 2px border Hijau Hutan, 3px hard shadow
      primary:
        "bg-[var(--leaf)] hover:bg-[var(--leaf-hover)] text-white border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
      // Secondary: Putih, border 2px Hijau Hutan, 3px hard shadow
      secondary:
        "bg-white hover:bg-[var(--surface-2)] text-[var(--forest)] border-2 border-[var(--forest)] shadow-[3px_3px_0px_var(--forest)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
      // Danger: Merah, border 2px Merah Gelap, 3px hard shadow
      danger:
        "bg-[var(--danger)] hover:bg-[var(--danger-hover)] text-white border-2 border-[#7C2011] shadow-[3px_3px_0px_#7C2011] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
      // Ghost: Transparan, teks Hijau Hutan
      ghost:
        "bg-transparent hover:bg-[var(--surface-2)] text-[var(--forest)] active:bg-[var(--disabled-bg)]",
      // Link: Tautan teks Hijau Daun
      link:
        "bg-transparent text-[var(--leaf)] hover:underline p-0 h-auto",
    };

    const sizeStyles = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-5 text-sm",
      lg: "h-12 px-6 text-base",
      xl: "h-14 px-8 text-base sm:text-lg",
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
