import "./landing.css";
import {
  LandingNavbar,
  HeroSection,
  SocialProofBar,
  ContrastSection,
  HowItWorksSection,
  EventTypesSection,
  PhotographersSection,
  StatsSection,
  TestimonialsSection,
  SecuritySection,
  FaqSection,
  CtaSection,
  LandingFooter,
  ScrollAnimationObserver,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <>
      <ScrollAnimationObserver />
      <LandingNavbar />
      <main>
        <HeroSection />
        <SocialProofBar />
        <ContrastSection />
        <HowItWorksSection />
        <EventTypesSection />
        <PhotographersSection />
        <StatsSection />
        <TestimonialsSection />
        <SecuritySection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </>
  );
}
