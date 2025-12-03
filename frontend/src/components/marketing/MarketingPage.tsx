'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { fetchSitePage } from '@/lib/api/sitePages'
import type { SitePage, SitePageSection } from '@/types/sitePage'
import { Spinner } from '@/components/ui/spinner'
import { LoginDialog } from '@/components/LoginDialog'

interface MarketingPageProps {
  slug: string
  defaultContent: {
    title: string
    heroTitle: string
    heroDescription: string
    sections: SitePageSection[]
  }
  sectionType?: 'hotels' | 'hostels'
}

const normalizeSections = (sections?: SitePageSection[] | null): SitePageSection[] => {
  if (!Array.isArray(sections) || sections.length === 0) return []

  return sections.map((section, index) => ({
    id: section.id ?? index,
    heading: section.heading ?? section.title ?? '',
    body: section.body ?? section.description ?? '',
    image: section.image,
    items: section.items,
  }))
}

export function MarketingPage({ slug, defaultContent, sectionType = 'hotels' }: MarketingPageProps) {
  const [page, setPage] = useState<SitePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [isNavModalOpen, setIsNavModalOpen] = useState(false)

  // Load login state from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("name")
    const storedAccessToken = localStorage.getItem("accessToken")
    
    if (storedName && storedAccessToken) {
      setIsLoggedIn(true)
      setUserName(storedName)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        const data = await fetchSitePage(slug)

        if (!isMounted) return

        setPage({
          ...data,
          sections: normalizeSections(data.sections),
        })
      } catch (error) {
        console.warn(`No remote content found for ${slug}. Falling back to defaults.`, error)
        if (isMounted) {
          setPage(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [slug])

  const handleLoginClick = () => {
    setIsLoginDialogOpen(true)
  }

  const handleLoginSuccess = (name: string) => {
    setIsLoggedIn(true)
    setUserName(name)
    setIsLoginDialogOpen(false)
  }

  const handleLogout = () => {
    localStorage.clear()
    setIsLoggedIn(false)
    setUserName("")
    window.location.href = "/"
  }

  const setShowDetailSection = (section: string) => {
    window.location.href = `/home?type=${section}`
  }

  const handleNavModalChange = (isOpen: boolean) => {
    setIsNavModalOpen(isOpen)
  }

  const heroTitle = page?.hero_title || page?.title || defaultContent.heroTitle
  const heroDescription = page?.hero_description || defaultContent.heroDescription
  const sections = page?.sections && page.sections.length > 0
    ? page.sections
    : normalizeSections(defaultContent.sections)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar
        isLoggedIn={isLoggedIn}
        userName={userName}
        handleLogout={handleLogout}
        handleLoginClick={handleLoginClick}
        setShowDetailSection={setShowDetailSection}
        isClosed={isClosed}
        currentSection={sectionType === 'hostels' ? 'hostel' : 'hotel'}
        onNavModalChange={handleNavModalChange}
      />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-[#A31C44] via-[#b11e43] to-[#8f1836] text-white">
          <div className="container mx-auto px-4 py-16 md:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              <p className="text-sm uppercase tracking-[0.35em] text-white/70">
                {defaultContent.title}
              </p>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                {heroTitle}
              </h1>
              {heroDescription && (
                <p className="text-lg leading-relaxed text-white/80">
                  {heroDescription}
                </p>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="h-12 w-12 border-2" />
          </div>
        ) : (
          <section className="py-16">
            <div className="container mx-auto space-y-12 px-4 md:px-6 lg:px-8">
              {sections.length === 0 ? (
                <div className="rounded-xl bg-white p-8 text-center text-gray-600 shadow-sm">
                  Content coming soon.
                </div>
              ) : (
                sections.map((section, index) => {
                  const sectionKey = `${slug}-section-${section.id ?? index}`
                  return (
                    <div
                      key={sectionKey}
                      className="rounded-xl bg-white p-8 shadow-sm"
                    >
                      <div className="space-y-6">
                        {section.heading && (
                          <h2 className="text-2xl font-semibold text-[#A31C44] md:text-3xl">
                            {section.heading}
                          </h2>
                        )}
                        {section.body && (
                          <p className="text-gray-700 leading-relaxed">
                            {section.body}
                          </p>
                        )}
                        {section.image && (
                          <div className="overflow-hidden rounded-xl border border-gray-100">
                            <img
                              src={section.image}
                              alt={section.heading || `${defaultContent.title} section ${index + 1}`}
                              className="h-auto w-full object-cover"
                            />
                          </div>
                        )}

                        {Array.isArray(section.items) && section.items.length > 0 && (
                          <div className="grid gap-6 md:grid-cols-2">
                            {section.items.map((item, itemIndex) => (
                              <div key={`${sectionKey}-item-${itemIndex}`} className="rounded-lg bg-gray-50 p-6">
                                {item.title && (
                                  <h3 className="text-lg font-semibold text-[#A31C44]">
                                    {item.title}
                                  </h3>
                                )}
                                {item.description && (
                                  <p className="mt-2 text-gray-600 leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        )}
      </main>

      <Footer sectionType={sectionType} />
      
      <LoginDialog 
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}

