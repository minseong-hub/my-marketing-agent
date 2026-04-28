"use client";
import { CockpitNav } from "@/components/layout/CockpitNav";
import { Footer } from "@/components/layout/Footer";
import { HeroCockpit } from "@/components/sections/HeroCockpit";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { CtaSection } from "@/components/sections/CtaSection";

export default function LandingPage() {
  return (
    <div style={{ background: "#060920", minHeight: "100vh" }}>
      <CockpitNav />
      <div style={{ padding: "12px 16px 0" }}>
        <HeroCockpit />
      </div>
      <HowItWorks />
      <Pricing />
      <Faq />
      <CtaSection />
      <Footer />
    </div>
  );
}
