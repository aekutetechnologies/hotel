import { MarketingPage } from '@/components/marketing/MarketingPage'
import type { SitePageSection } from '@/types/sitePage'

const sections: SitePageSection[] = [
  {
    heading: 'Unlock better occupancy and revenue',
    body: 'Leverage HSquare Living’s distribution, brand standards, and revenue management expertise to attract premium travellers 365 days a year.',
    items: [
      {
        title: 'Dedicated account management',
        description: 'Work with specialists who understand your property goals and help optimise pricing, positioning, and guest satisfaction.',
      },
      {
        title: 'Centralised operations',
        description: 'From housekeeping to guest communication and technology integration, we streamline operations so you can focus on growth.',
      },
    ],
  },
  {
    heading: 'Become part of a trusted hospitality network',
    body: 'Join a growing ecosystem of hotels, hostels, and experiential stays that travellers rely on for consistency, comfort, and curated design.',
  },
  {
    heading: 'Let’s co-create unforgettable stays',
    body: 'Partner with us to transform your property into a high-performing destination with signature HSquare Living service standards.',
  },
]

const defaultContent = {
  title: 'Partner With Us',
  heroTitle: 'Grow with HSquare Living',
  heroDescription:
    'Collaborate with us to elevate your property, unlock steady revenue, and deliver experiences that keep guests coming back.',
  sections,
}

export default function PartnerWithUsPage() {
  return <MarketingPage slug='partner-with-us' defaultContent={defaultContent} />
}

