'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { PermissionGuard } from '@/components/PermissionGuard'
import { toast } from 'react-toastify'
import { fetchSitePages, updateSitePage, createSitePage, uploadSitePageImage } from '@/lib/api/sitePages'
import type { SitePage, SitePageSection } from '@/types/sitePage'

type SitePageForm = Omit<SitePage, 'id' | 'created_at' | 'updated_at'> & {
  id?: number
}

const MANAGED_PAGES: Array<{ slug: string; title: string; description: string }> = [
  {
    slug: 'events',
    title: 'Events',
    description: 'Curate and update content for your events landing page.',
  },
  {
    slug: 'team',
    title: 'Team',
    description: 'Introduce your leadership and core team members.',
  },
  {
    slug: 'partner-with-us',
    title: 'Partner With Us',
    description: 'Share partnership opportunities and lead capture information.',
  },
]

const createDefaultSection = (): SitePageSection => ({
  heading: '',
  body: '',
})

const createDefaultPage = (slug: string, title: string): SitePageForm => ({
  slug,
  title,
  hero_title: title,
  hero_description: '',
  sections: [createDefaultSection()],
  extra: {},
  is_active: true,
})

const normalizeSections = (sections?: SitePageSection[] | null): SitePageSection[] => {
  if (!Array.isArray(sections) || sections.length === 0) {
    return [createDefaultSection()]
  }

  return sections.map(section => ({
    ...section,
    heading: section.heading ?? section.title ?? '',
    body: section.body ?? section.description ?? '',
  }))
}

export default function SitePagesAdmin() {
  const [pages, setPages] = useState<Record<string, SitePageForm>>({})
  const [loading, setLoading] = useState(true)
  const [savingSlug, setSavingSlug] = useState<string | null>(null)
  const [uploadingSectionKey, setUploadingSectionKey] = useState<string | null>(null)

  const loadPages = async () => {
    try {
      setLoading(true)
      const existingPages = await fetchSitePages()

      const mapped = MANAGED_PAGES.reduce<Record<string, SitePageForm>>((acc, config) => {
        const existing = existingPages.find(page => page.slug === config.slug)

        if (existing) {
          acc[config.slug] = {
            id: existing.id,
            slug: existing.slug,
            title: existing.title || config.title,
            hero_title: existing.hero_title || existing.title || config.title,
            hero_description: existing.hero_description || '',
            sections: normalizeSections(existing.sections),
            extra: existing.extra || {},
            is_active: existing.is_active ?? true,
          }
        } else {
          acc[config.slug] = createDefaultPage(config.slug, config.title)
        }

        return acc
      }, {})

      setPages(mapped)
    } catch (error) {
      console.error('Failed to load site pages', error)
      toast.error('Failed to load page content. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPages()
  }, [])

  const handleFieldChange = (slug: string, field: keyof SitePageForm, value: any) => {
    setPages(prev => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        [field]: value,
      },
    }))
  }

  const handleSectionChange = (slug: string, index: number, field: keyof SitePageSection, value: string) => {
    setPages(prev => {
      const sections = [...(prev[slug]?.sections || [])]
      sections[index] = {
        ...sections[index],
        [field]: value,
      }

      return {
        ...prev,
        [slug]: {
          ...prev[slug],
          sections,
        },
      }
    })
  }

  const handleSectionImageUpload = async (slug: string, index: number, file: File | null) => {
    if (!file) return

    const key = `${slug}-${index}`

    try {
      setUploadingSectionKey(key)
      const formData = new FormData()
      formData.append('image', file)
      formData.append('slug', slug)
      const result = await uploadSitePageImage(formData)
      handleSectionChange(slug, index, 'image', result.image_url)
      toast.success('Image uploaded successfully.')
    } catch (error: any) {
      console.error('Failed to upload section image', error)
      toast.error(error?.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploadingSectionKey(null)
    }
  }

  const handleAddSection = (slug: string) => {
    setPages(prev => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        sections: [...(prev[slug]?.sections || []), createDefaultSection()],
      },
    }))
  }

  const handleRemoveSection = (slug: string, index: number) => {
    setPages(prev => {
      const sections = [...(prev[slug]?.sections || [])]
      sections.splice(index, 1)

      return {
        ...prev,
        [slug]: {
          ...prev[slug],
          sections: sections.length > 0 ? sections : [createDefaultSection()],
        },
      }
    })
  }

  const handleSave = async (slug: string) => {
    const page = pages[slug]
    if (!page) return

    try {
      setSavingSlug(slug)

      const payload = {
        slug: page.slug,
        title: page.title,
        hero_title: page.hero_title,
        hero_description: page.hero_description,
        sections: (page.sections || []).map(section => ({
          ...section,
          heading: section.heading ?? '',
          body: section.body ?? section.description ?? '',
        })),
        extra: page.extra ?? {},
        is_active: page.is_active ?? true,
      }

      let updated: SitePage
      if (page.id) {
        updated = await updateSitePage(slug, payload)
      } else {
        updated = await createSitePage(payload)
      }

      setPages(prev => ({
        ...prev,
        [slug]: {
          id: updated.id,
          slug: updated.slug,
          title: updated.title,
          hero_title: updated.hero_title,
          hero_description: updated.hero_description,
          sections: normalizeSections(updated.sections),
          extra: updated.extra || {},
          is_active: updated.is_active ?? true,
        },
      }))

      toast.success(`${page.title} page saved successfully.`)
    } catch (error: any) {
      console.error(`Failed to save ${slug} page`, error)
      toast.error(error?.message || `Failed to save ${slug} page.`)
    } finally {
      setSavingSlug(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-10 w-10 border-2" />
      </div>
    )
  }

  return (
    <PermissionGuard permissions={['admin:pages:manage']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Pages</h1>
          <p className="text-gray-600 mt-2">
            Update the content shown on your public Events, Team, and Partner With Us pages.
          </p>
        </div>

        {MANAGED_PAGES.map(config => {
          const page = pages[config.slug] ?? createDefaultPage(config.slug, config.title)
          return (
            <Card key={config.slug} className="border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="flex items-center justify-between">
                  <span>{config.title}</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Checkbox
                      id={`${config.slug}-active`}
                      checked={page.is_active ?? true}
                      onCheckedChange={checked => handleFieldChange(config.slug, 'is_active', Boolean(checked))}
                    />
                    <Label htmlFor={`${config.slug}-active`} className="cursor-pointer">
                      Visible on site
                    </Label>
                  </div>
                </CardTitle>
                <p className="text-sm text-gray-500">{config.description}</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${config.slug}-title`}>Page Title</Label>
                    <Input
                      id={`${config.slug}-title`}
                      value={page.title}
                      onChange={event => handleFieldChange(config.slug, 'title', event.target.value)}
                      placeholder={`${config.title} Page`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${config.slug}-hero-title`}>Hero Title</Label>
                    <Input
                      id={`${config.slug}-hero-title`}
                      value={page.hero_title ?? ''}
                      onChange={event => handleFieldChange(config.slug, 'hero_title', event.target.value)}
                      placeholder={`Headline for ${config.title}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${config.slug}-hero-description`}>Hero Description</Label>
                  <Textarea
                    id={`${config.slug}-hero-description`}
                    value={page.hero_description ?? ''}
                    rows={4}
                    onChange={event => handleFieldChange(config.slug, 'hero_description', event.target.value)}
                    placeholder={`Add a short description for the ${config.title.toLowerCase()} page.`}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Content Sections</h3>
                    <Button
                      variant="neutral"
                      size="sm"
                      onClick={() => handleAddSection(config.slug)}
                    >
                      Add Section
                    </Button>
                  </div>

                  {(page.sections || []).map((section, index) => (
                    <div key={`${config.slug}-section-${index}`} className="rounded-lg border border-gray-200 p-4 space-y-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-700">Section {index + 1}</h4>
                        {(page.sections || []).length > 1 && (
                          <Button
                            variant="neutral"
                            size="sm"
                            onClick={() => handleRemoveSection(config.slug, index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${config.slug}-section-${index}-heading`}>Heading</Label>
                        <Input
                          id={`${config.slug}-section-${index}-heading`}
                          value={section.heading ?? ''}
                          onChange={event => handleSectionChange(config.slug, index, 'heading', event.target.value)}
                          placeholder="Section heading"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${config.slug}-section-${index}-body`}>Description</Label>
                        <Textarea
                          id={`${config.slug}-section-${index}-body`}
                          value={section.body ?? section.description ?? ''}
                          rows={4}
                          onChange={event => handleSectionChange(config.slug, index, 'body', event.target.value)}
                          placeholder="Add descriptive text for this section"
                        />
                      </div>
                        <div className="space-y-2">
                          <Label>Image (optional)</Label>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="neutral"
                                size="sm"
                                disabled={uploadingSectionKey === `${config.slug}-${index}`}
                                onClick={() =>
                                  document
                                    .getElementById(`${config.slug}-section-${index}-image-input`)
                                    ?.click()
                                }
                              >
                                {uploadingSectionKey === `${config.slug}-${index}`
                                  ? 'Uploading...'
                                  : section.image
                                  ? 'Replace Image'
                                  : 'Upload Image'}
                              </Button>
                              {section.image && (
                                <span className="text-xs text-gray-500 truncate max-w-[200px]">
                                  {section.image}
                                </span>
                              )}
                            </div>
                            <input
                              id={`${config.slug}-section-${index}-image-input`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={event => {
                                const file = event.target.files?.[0] || null
                                handleSectionImageUpload(config.slug, index, file)
                                event.target.value = ''
                              }}
                            />
                          </div>
                          {section.image && (
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                              <img
                                src={section.image}
                                alt={`${config.title} section ${index + 1}`}
                                className="h-40 w-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button
                    className="bg-[#B11E43] hover:bg-[#8f1836]"
                    onClick={() => handleSave(config.slug)}
                    disabled={savingSlug === config.slug}
                  >
                    {savingSlug === config.slug ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PermissionGuard>
  )
}

