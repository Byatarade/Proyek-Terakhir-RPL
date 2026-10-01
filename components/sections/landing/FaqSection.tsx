"use client";

import React, { useState } from "react";
import { landingContent } from "@/content/landing";
import { Badge } from "@/components/atoms/Badge";
import { HelpCircle, ChevronDown } from "lucide-react";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { faq } = landingContent;

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-white py-16 lg:py-24 border-b border-[var(--line)]">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <Badge variant="mint" size="sm" className="mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-900" />
            <span className="font-heading uppercase tracking-wider text-[11px] font-medium">
              {faq.overline}
            </span>
          </Badge>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[40px] leading-tight tracking-tight text-zinc-950 mb-4">
            {faq.headline}
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
            {faq.description}
          </p>
        </div>

        {/* Minimalist Accordion */}
        <div className="bg-white border border-[var(--line-strong)]/70 rounded-2xl shadow-card divide-y divide-[var(--line)] overflow-hidden">
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:bg-[var(--surface-2)]/60 hover:bg-[var(--surface-2)]/40 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading font-semibold text-base sm:text-lg text-zinc-950">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0 text-zinc-700 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-7 text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
