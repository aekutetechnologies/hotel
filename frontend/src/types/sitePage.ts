export interface SitePageSection {
  id?: string | number
  title?: string
  heading?: string
  subheading?: string
  body?: string
  description?: string
  image?: string
  items?: Array<{ title: string; description: string }>
  ctaLabel?: string
  ctaHref?: string
}

export interface SitePage {
  id: number
  slug: string
  title: string
  hero_title?: string | null
  hero_description?: string | null
  sections: SitePageSection[]
  extra?: Record<string, any>
  created_at: string
  updated_at: string
  is_active: boolean
}

