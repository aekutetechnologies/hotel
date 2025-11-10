import { MarketingPage } from '@/components/marketing/MarketingPage'
import type { SitePageSection } from '@/types/sitePage'

const sections: SitePageSection[] = [
  {
    heading: 'Built by hospitality specialists',
    body: 'Led by seasoned professionals across operations, design, finance, and technology, our leadership team blends global experience with a deep understanding of India’s hospitality landscape.',
  },
  {
    heading: 'Powered by passionate hosts',
    body: 'Across every property, our on-ground teams go above and beyond to make sure every guest feels heard, supported, and celebrated throughout their stay.',
  },
  {
    heading: 'Driven by a shared purpose',
    body: 'We are united by a single mission—to reimagine hotels and hostels for modern travellers through thoughtful design, meaningful service, and memorable experiences.',
  },
]

const defaultContent = {
  title: 'Team',
  heroTitle: 'Meet the people behind HSquare Living',
  heroDescription:
    'A collective of hospitality experts, designers, and storytellers working together to craft unforgettable stays across India.',
  sections,
}

export default function TeamPage() {
  return <MarketingPage slug="team" defaultContent={defaultContent} />
}

