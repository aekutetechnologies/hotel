import { MarketingPage } from '@/components/marketing/MarketingPage'
import type { SitePageSection } from '@/types/sitePage'

const sections: SitePageSection[] = [
  {
    heading: 'Tailored venues for every occasion',
    body: 'From corporate offsites to intimate celebrations, our curated portfolio of hotels and hostels across India feature flexible venues, modern amenities, and hospitality teams that execute every detail flawlessly.',
  },
  {
    heading: 'Dedicated event specialists',
    body: 'Our on-ground experts assist with planning, vendor coordination, décor, catering, and guest logistics so you can focus on creating unforgettable moments.',
  },
  {
    heading: 'Seamless guest experiences',
    body: 'Ensure your attendees enjoy comfortable stays, curated itineraries, and local experiences with our concierge support and city partners.',
  },
]

const defaultContent = {
  title: 'Events',
  heroTitle: 'Host remarkable events with HSquare Living',
  heroDescription:
    'Transform your next gathering with inspiring venues, warm hospitality, and end-to-end event management across our hotels and hostels.',
  sections,
}

export default function EventsPage() {
  return <MarketingPage slug="events" defaultContent={defaultContent} />
}

