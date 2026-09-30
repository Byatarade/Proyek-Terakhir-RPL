import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency to Indonesian Rupiah standard (e.g. "Rp 25.000")
 * Conforms to design.md Section 3.3 (no decimal places, dot as thousand separator)
 */
export function formatRupiah(amount: number): string {
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `Rp ${formatted}`;
}
