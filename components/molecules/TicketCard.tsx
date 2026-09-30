import React from "react";
import { cn } from "@/lib/utils";

interface TicketCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Minimalist TicketCard:
 * Clean, modern receipt-style card with soft elevation, fine border,
 * and elegant rounded-2xl corners.
 */
export function TicketCard({
  children,
  className,
}: TicketCardProps) {
  return (
    <div
      className={cn(
        "relative bg-white border border-[var(--line-strong)]/70 rounded-2xl shadow-card transition-all duration-300 overflow-visible",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Minimalist Perforation divider line inside ticket with soft notches
 */
export function TicketPerforation({ className }: { className?: string }) {
  return (
    <div className={cn("relative my-4 flex items-center justify-between", className)}>
      {/* Left notch */}
      <div
        className="absolute -left-[10px] w-5 h-5 rounded-full bg-[var(--bg)] border border-[var(--line-strong)]/70 z-10"
        aria-hidden="true"
      />
      {/* Dashed perforation line */}
      <div className="w-full border-b border-dashed border-[var(--line-strong)] mx-2 opacity-60" />
      {/* Right notch */}
      <div
        className="absolute -right-[10px] w-5 h-5 rounded-full bg-[var(--bg)] border border-[var(--line-strong)]/70 z-10"
        aria-hidden="true"
      />
    </div>
  );
}
