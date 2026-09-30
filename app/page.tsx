import CaseGuide from "@/components/landing/case-guide";
import LandingClose from "@/components/landing/landing-close";
import LandingHero from "@/components/landing/landing-hero";
import Header from "@/components/layout/Header";

export default function Home() {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <Header />
      <LandingHero />
      <CaseGuide />
      <LandingClose />
      <footer className="py-8 text-center text-xs text-soft border-t border-line">
        Deducto
      </footer>
    </div>
  );
}
