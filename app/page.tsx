import type { Metadata } from 'next'

import CaseGuide from '@/components/landing/case-guide'
import LandingClose from '@/components/landing/landing-close'
import LandingHero from '@/components/landing/landing-hero'
import Header from '@/components/layout/Header'
import { SiteFooter } from '@/components/layout/site-footer'
import { SITE_DESCRIPTION, siteUrl } from '@/config/site'

export const metadata: Metadata = {
  title: 'Trò chơi suy luận, phá án online',
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Deducto',
      url: siteUrl('/'),
      inLanguage: 'vi',
      description: SITE_DESCRIPTION,
    },
    {
      '@type': 'VideoGame',
      name: 'Deducto',
      url: siteUrl('/'),
      description: SITE_DESCRIPTION,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Web',
      playMode: 'SinglePlayer',
      genre: ['Puzzle', 'Detective'],
      inLanguage: 'vi',
    },
  ],
}

export default function Home() {
	return (
		<div className="min-h-dvh bg-paper text-pencil">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<Header />
			<LandingHero />
			<CaseGuide />
			<LandingClose />
			<SiteFooter />
		</div>
	)
}
