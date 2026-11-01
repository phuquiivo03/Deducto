import type { Metadata } from 'next'

import CaseGuide from '@/components/landing/case-guide'
import LandingClose from '@/components/landing/landing-close'
import LandingHero from '@/components/landing/landing-hero'
import Header from '@/components/layout/Header'
import { SiteFooter } from '@/components/layout/site-footer'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, siteUrl } from '@/config/site'
import { pageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: '/',
  absoluteTitle: true,
})

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
