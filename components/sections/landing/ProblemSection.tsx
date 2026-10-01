import React from "react";
import { landingContent } from "@/content/landing";
import { Badge } from "@/components/atoms/Badge";
import { AlertTriangle, ChefHat, Users, DollarSign } from "lucide-react";

export function ProblemSection() {
  const { problem } = landingContent;

  const iconMap: Record<string, React.ReactNode> = {
    p1: <ChefHat className="w-5 h-5 text-[var(--leaf)]" />,
    p2: <Users className="w-5 h-5 text-[var(--leaf)]" />,
    p3: <DollarSign className="w-5 h-5 text-[var(--leaf)]" />,
  };

  return (
    <section className="bg-white text-[var(--ink)] py-16 lg:py-24 border-b border-[var(--line)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <Badge variant="mint" size="sm" className="mb-4">
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--leaf)]" />
            <span className="font-heading uppercase tracking-wider text-[11px] font-medium">
              {problem.overline}
            </span>
          </Badge>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[40px] leading-tight tracking-tight text-zinc-950 mb-4">
            {problem.headline}
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            {problem.description}
          </p>
        </div>

        {/* 3 Minimalist Problem Cards on White Background */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {problem.problems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[var(--line-strong)]/70 hover:border-[var(--line-strong)] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-card hover:shadow-card-hover"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    {iconMap[item.id]}
                  </div>
                  <span className="text-[11px] font-medium tracking-wide uppercase text-zinc-600 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-xl text-zinc-950 mb-2.5 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-600 mb-6">
                  {item.description}
                </p>
              </div>

              {/* Bottom Impact */}
              <div className="pt-4 border-t border-[var(--line)] flex items-center gap-2 text-xs font-medium text-[var(--danger)]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--danger)] shrink-0" />
                <span>Dampak: {item.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
