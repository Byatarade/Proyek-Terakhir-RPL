import React from "react";
import { landingContent } from "@/content/landing";
import { Badge } from "@/components/atoms/Badge";
import { TicketCard, TicketPerforation } from "@/components/molecules/TicketCard";
import { QrCode, CreditCard, BellRing, Check } from "lucide-react";

export function HowItWorksSection() {
  const { howItWorks } = landingContent;

  const iconMap: Record<string, React.ReactNode> = {
    "01": <QrCode className="w-5 h-5 text-[var(--leaf)]" />,
    "02": <CreditCard className="w-5 h-5 text-[var(--leaf)]" />,
    "03": <BellRing className="w-5 h-5 text-[var(--leaf)]" />,
  };

  return (
    <section id="cara-kerja" className="bg-white py-16 lg:py-24 border-b border-[var(--line)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <Badge variant="mint" size="sm" className="mb-4">
            <span className="font-heading uppercase tracking-wider text-[11px] font-semibold">
              {howItWorks.overline}
            </span>
          </Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[40px] leading-tight tracking-tight text-zinc-950 mb-4">
            {howItWorks.headline}
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
            {howItWorks.description}
          </p>
        </div>

        {/* 3 Step Cards Grid (Minimalist) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {howItWorks.steps.map((step, idx) => (
            <TicketCard key={step.number} className="p-6 sm:p-7 flex flex-col justify-between bg-white hover:border-[var(--line-strong)]">
              <div>
                {/* Step Number & Icon Header */}
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-950 tabular-nums">
                      {step.number}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 border border-[var(--line)] px-2.5 py-0.5 rounded-full bg-[var(--surface-2)]">
                      Langkah {idx + 1}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    {iconMap[step.number]}
                  </div>
                </div>

                {/* Step Title & Subtitle */}
                <div className="mt-4 mb-2.5">
                  <h3 className="font-heading font-bold text-xl text-zinc-950 leading-snug">
                    {step.title}
                  </h3>
                  <span className="text-xs font-medium text-zinc-600 block mt-1">
                    {step.subtitle}
                  </span>
                </div>

                <p className="text-sm text-zinc-600 leading-relaxed mb-4">
                  {step.description}
                </p>
              </div>

              <div>
                {/* Divider */}
                <TicketPerforation />

                {/* Key Bullet Points */}
                <ul className="space-y-2 pt-1 text-xs font-medium text-zinc-800">
                  {step.points.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-[var(--mint-light)] text-[var(--leaf)] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                      </div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TicketCard>
          ))}
        </div>
      </div>
    </section>
  );
}
