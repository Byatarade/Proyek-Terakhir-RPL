import { NavbarSection } from "@/components/sections/landing/NavbarSection";
import { HeroSection } from "@/components/sections/landing/HeroSection";
import { ProblemSection } from "@/components/sections/landing/ProblemSection";
import { HowItWorksSection } from "@/components/sections/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/sections/landing/FeaturesSection";
import { DemoPreviewSection } from "@/components/sections/landing/DemoPreviewSection";
import { PricingSection } from "@/components/sections/landing/PricingSection";
import { FaqSection } from "@/components/sections/landing/FaqSection";
import { CtaSection } from "@/components/sections/landing/CtaSection";
import { FooterSection } from "@/components/sections/landing/FooterSection";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LandingPage() {
  const { user, profile, store } = await getAuthenticatedProfile();

  return (
    <SmoothScrollProvider>
      <div className="flex flex-col min-h-screen">
        <NavbarSection
          initialUser={user}
          initialRole={profile?.role}
          storeName={store?.name}
        />
        <main className="flex-1">
          <HeroSection />
          <ProblemSection />
          <HowItWorksSection />
          <FeaturesSection />
          <DemoPreviewSection />
          <PricingSection />
          <FaqSection />
          <CtaSection />
        </main>
        <FooterSection />
      </div>
    </SmoothScrollProvider>
  );
}
