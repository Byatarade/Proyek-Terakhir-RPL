import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", hasError, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={cn(
          "w-full h-11 px-3.5 rounded-lg bg-white text-[var(--ink)] placeholder:text-[var(--muted)] text-sm font-normal",
          "border border-[var(--control)] transition-all duration-150",
          "focus:outline-none focus:border-[var(--leaf)] focus:ring-2 focus:ring-[var(--leaf)]/20",
          "disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)] disabled:cursor-not-allowed",
          hasError &&
            "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20 text-[var(--danger)]",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
