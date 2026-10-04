import React from "react";
import Link from "next/link";
import { landingContent } from "@/content/landing";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { TicketCard, TicketPerforation } from "@/components/molecules/TicketCard";
import { Check, Tag, ArrowRight } from "lucide-react";

export function PricingSection() {
  const { pricing } = landingContent;

  return (
    <section id="harga" className="bg-white py-16 lg:py-24 border-b border-[var(--line)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <Badge variant="mint" size="sm" className="mb-4">
            <Tag className="w-3.5 h-3.5 text-zinc-900" />
            <span className="font-heading uppercase tracking-wider text-[11px] font-medium">
              {pricing.overline}
            </span>
          </Badge>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[40px] leading-tight tracking-tight text-zinc-950 mb-4">
            {pricing.headline}
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
            {pricing.description}
          </p>
        </div>

        {/* 3 Pricing Cards Grid (Minimalist) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-stretch">
          {pricing.plans.map((plan) => (
            <TicketCard
              key={plan.id}
              className={`p-6 sm:p-7 flex flex-col justify-between ${
                plan.isPrimary
                  ? "bg-white border-2 border-[var(--leaf)]/70 shadow-card-hover relative"
                  : "bg-white border border-[var(--line-strong)]/70 hover:border-[var(--line-strong)]"
              }`}
            >
              <div>
                {/* Header: Plan Name & Badge */}
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                  <h3 className="font-heading font-semibold text-2xl text-zinc-950">
                    {plan.name}
                  </h3>
                  {plan.badge.isActive ? (
                    <Badge variant="leaf" size="sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--leaf)] inline-block mr-1" />
                      {plan.badge.text}
                    </Badge>
                  ) : (
                    <Badge variant="mint" size="sm">
                      {plan.badge.text}
                    </Badge>
                  )}
                </div>

                {/* Price Display */}
                <div className="my-5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading font-bold text-3xl sm:text-4xl text-zinc-950 tabular-nums tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs font-medium text-[var(--muted)]">
                      / {plan.period}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--muted)] mt-2 leading-relaxed min-h-[64px]">
                    {plan.description}
                  </p>
                </div>

                {/* Target Audience Note */}
                <div className="p-3 rounded-xl bg-[var(--surface-2)]/70 border border-[var(--line)] text-xs text-[var(--muted)] mb-4 min-h-[80px] flex items-center">
                  <div>
                    <strong className="text-zinc-950">Target:</strong> {plan.target}
                  </div>
                </div>

                {/* Perforation */}
                <TicketPerforation />

                {/* Feature List */}
                <div className="space-y-2.5 pt-1 mb-6">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)] block">
                    FITUR YANG DIDAPAT:
                  </span>
                  <ul className="space-y-2 text-xs font-medium text-zinc-900">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            plan.isPrimary
                              ? "bg-[var(--leaf)] text-white"
                              : "bg-emerald-50 text-[var(--leaf)]"
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-4 border-t border-[var(--line)]">
                {plan.isPrimary ? (
                  <Link href={plan.ctaHref}>
                    <Button variant="primary" size="lg" className="w-full gap-2 shadow-subtle">
                      {plan.ctaText}
                      <ArrowRight className="w-4 h-4 text-[var(--mint)]" />
                    </Button>
                  </Link>
                ) : (
                  <a href={plan.ctaHref}>
                    <Button variant="secondary" size="lg" className="w-full">
                      {plan.ctaText}
                    </Button>
                  </a>
                )}
              </div>
            </TicketCard>
          ))}
        </div>
      </div>
    </section>
  );
}
