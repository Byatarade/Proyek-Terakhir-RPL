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
    // Minimalist Landing Page Style: Clean rounded corners, elegant subtle shadows, smooth transitions
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)]/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantStyles = {
      // Primary: Vibrant Emerald Green, subtle elevation
      primary:
        "bg-[var(--leaf)] hover:bg-[var(--leaf-hover)] text-white shadow-xs hover:shadow-sm active:scale-[0.99]",
      // Secondary: Crisp white with refined fine border
      secondary:
        "bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 shadow-xs hover:border-zinc-300 active:scale-[0.99]",
      // Danger: Clean red with soft shadow
      danger:
        "bg-[var(--danger)] hover:bg-[var(--danger-hover)] text-white shadow-xs active:scale-[0.99]",
      // Ghost: Subtle hover on transparent
      ghost:
        "bg-transparent hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950",
      // Link: Clean inline text link
      link:
        "bg-transparent text-[var(--leaf)] hover:underline p-0 h-auto",
    };

    const sizeStyles = {
      sm: "h-9 px-3.5 text-xs",
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
