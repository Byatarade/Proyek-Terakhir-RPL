import React from "react";
import Link from "next/link";
import { landingContent } from "@/content/landing";
import { Button } from "@/components/atoms/Button";
import { ArrowRight, Store } from "lucide-react";

export function CtaSection() {
  const { cta } = landingContent;

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[var(--line-strong)] rounded-3xl p-8 sm:p-12 lg:p-16 shadow-card text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-[var(--surface-2)] border border-[var(--line)] text-zinc-950 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide">
            <Store className="w-3.5 h-3.5 text-[var(--leaf)]" />
            <span>Mulai Dalam 2 Menit</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight text-zinc-950 max-w-3xl mx-auto">
            {cta.headline}
          </h2>

          <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed font-normal">
            {cta.subheadline}
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={cta.buttonHref}>
              <Button
                variant="primary"
                size="xl"
                className="w-full sm:w-auto gap-2.5 text-base sm:text-lg px-8 shadow-card"
              >
                {cta.buttonText}
                <ArrowRight className="w-5 h-5 text-white" />
              </Button>
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-[var(--muted)] font-normal pt-1">
            ✓ {cta.note}
          </p>
        </div>
      </div>
    </section>
  );
}
