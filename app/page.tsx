import CaseGuide from '@/components/landing/case-guide'
import LandingClose from '@/components/landing/landing-close'
import LandingHero from '@/components/landing/landing-hero'
import Header from '@/components/layout/Header'
import { SiteFooter } from '@/components/layout/site-footer'

export default function Home() {
	return (
		<div className="min-h-dvh bg-paper text-pencil">
			<Header />
			<LandingHero />
			<CaseGuide />
			<LandingClose />
			<SiteFooter />
		</div>
	)
}
