import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  id,
  label,
  required,
  helpText,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs sm:text-sm font-semibold text-[var(--ink)] select-none"
        >
          {label}
          {required && <span className="text-[var(--danger)] ml-1" aria-hidden="true">*</span>}
        </label>
      </div>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--danger)] mt-0.5"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : helpText ? (
        <p
          id={`${id}-help`}
          className="text-xs text-[var(--muted)] mt-0.5"
        >
          {helpText}
        </p>
      ) : null}
    </div>
  );
}
