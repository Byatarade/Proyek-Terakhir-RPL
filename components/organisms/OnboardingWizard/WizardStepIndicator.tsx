import React from "react";
import { Check } from "lucide-react";
import { WizardStepIndicatorProps } from "./types";

export function WizardStepIndicator({
  step,
  onSetStep,
}: WizardStepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--line)] -translate-y-1/2 z-0" />

        {/* Step 1 */}
        <div className="relative z-10 flex flex-col items-center">
          <button
            type="button"
            onClick={() => onSetStep(1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-semibold text-sm transition-all border ${
              step === 1
                ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-card"
                : step > 1
                ? "bg-emerald-600 text-white border-emerald-600 cursor-pointer"
                : "bg-white text-[var(--muted)] border-[var(--line-strong)]"
            }`}
          >
            {step > 1 ? <Check className="w-4 h-4" /> : "01"}
          </button>
          <span
            className={`text-xs font-semibold mt-2 ${
              step === 1 ? "text-[var(--forest)]" : "text-[var(--muted)]"
            }`}
          >
            Toko
          </span>
        </div>

        {/* Step 2 (Pertanyaan QRIS - PRD Focus) */}
        <div className="relative z-10 flex flex-col items-center">
          <button
            type="button"
            onClick={() => onSetStep(2)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-semibold text-sm transition-all border ${
              step === 2
                ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-card ring-4 ring-emerald-500/20"
                : step > 2
                ? "bg-emerald-600 text-white border-emerald-600 cursor-pointer"
                : "bg-white text-[var(--muted)] border-[var(--line-strong)]"
            }`}
          >
            {step > 2 ? <Check className="w-4 h-4" /> : "02"}
          </button>
          <span
            className={`text-xs font-semibold mt-2 ${
              step === 2 ? "text-[var(--leaf)] font-bold" : "text-[var(--muted)]"
            }`}
          >
            Metode QRIS
          </span>
        </div>

        {/* Step 3 */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-semibold text-sm transition-all border ${
              step === 3
                ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-card"
                : "bg-white text-[var(--muted)] border-[var(--line-strong)]"
            }`}
          >
            03
          </div>
          <span
            className={`text-xs font-semibold mt-2 ${
              step === 3 ? "text-[var(--forest)]" : "text-[var(--muted)]"
            }`}
          >
            Selesai
          </span>
        </div>
      </div>
    </div>
  );
}
