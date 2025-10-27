'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import LexicalEditor from '@/components/blog/LexicalEditor'
import { fetchBlogBySlug } from '@/lib/api/fetchBlogBySlug'
import { updateBlog } from '@/lib/api/updateBlog'
import { fetchBlogCategories } from '@/lib/api/fetchBlogCategories'
import { fetchBlogTags } from '@/lib/api/fetchBlogTags'
import { BlogCategory, BlogTag } from '@/types/blog'
import { ImageGalleryUploader } from '@/components/blog/ImageGalleryUploader'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { LoadingIndicator } from '@/components/ui/LoadingIndicator'
import { usePermissions } from '@/hooks/usePermissions'

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const { can, isLoaded } = usePermissions()
  
  const [title, setTitle] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [featuredImageId, setFeaturedImageId] = useState<number | null>(null)
  const [galleryImages, setGalleryImages] = useState<{ id: number; image_url: string; alt_text?: string }[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isLoaded && !can('blog:edit')) {
      toast.error('You do not have permission to edit blogs')
      router.push('/admin/blogs')
    }
  }, [isLoaded, can, router])

  useEffect(() => {
    loadBlogData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const loadBlogData = async () => {
    try {
      const [blogData, categoriesData, tagsData] = await Promise.all([
        fetchBlogBySlug(slug),
        fetchBlogCategories(),
        fetchBlogTags()
      ])
      
      setTitle(blogData.title)
      setNewSlug(blogData.slug)
      setContent(blogData.content)
      setCategoryId(blogData.category?.id || null)
      setFeaturedImageId(blogData.featured_image?.id || null)
      setGalleryImages(blogData.images?.map(img => ({
        id: img.id,
        image_url: img.image_url || img.image || '',
        alt_text: img.alt_text
      })) || [])
      setSelectedTagIds(blogData.tags.map(tag => tag.id))
      setIsHighlighted(blogData.is_highlighted)
      setIsPublished(blogData.is_published)
      
      setCategories(categoriesData)
      setTags(tagsData)
    } catch (error) {
      console.error('Failed to load blog:', error)
      toast.error('Failed to load blog')
      router.push('/admin/blogs')
    } finally {
      setLoading(false)
    }
  }

  const handleGalleryImagesChange = (updatedImages: { id: number; image_url: string; alt_text?: string }[]) => {
    setGalleryImages(updatedImages)
  }

  const handleSubmit = async (publish?: boolean) => {
    if (!can('blog:edit')) {
      toast.error('You do not have permission to edit blogs')
      return
    }

    if (publish !== undefined && publish !== isPublished && !can('blog:publish')) {
      toast.error('You do not have permission to publish/unpublish blogs')
      return
    }

    if (!title || !content) {
      toast.error('Title and content are required')
      return
    }

    try {
      setSaving(true)
      await updateBlog(slug, {
        title,
        slug: newSlug !== slug ? newSlug : undefined,
        content,
        category_id: categoryId,
        featured_image_id: featuredImageId,
        image_ids: galleryImages.map(img => img.id),
        tag_ids: selectedTagIds,
        is_highlighted: isHighlighted,
        is_published: publish !== undefined ? publish : isPublished,
      })
      toast.success('Blog updated successfully')
      router.push('/admin/blogs')
    } catch (error) {
      console.error('Failed to update blog:', error)
      toast.error('Failed to update blog')
    } finally {
      setSaving(false)
    }
  }

  const toggleTag = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <LoadingIndicator variant="dots" size="lg" text="Loading blog..." />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/blogs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blogs
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
            <p className="text-gray-600">{title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="neutral"
            onClick={() => handleSubmit()}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          {can('blog:publish') && (
            <>
              {isPublished ? (
                <Button
                  variant="neutral"
                  onClick={() => handleSubmit(false)}
                  disabled={saving}
                >
                  Unpublish
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={saving}
                  className="bg-[#B11E43] hover:bg-[#8f1836]"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Publish
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter blog title"
                  className="text-2xl font-bold"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug (Blog URL) *</Label>
                <Input
                  id="slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="auto-generated-from-title"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /blog/{newSlug}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardContent className="p-6">
              <Label className="mb-2 block">Content *</Label>
              <LexicalEditor
                initialContent={content}
                onChange={setContent}
                placeholder="Write your blog content here..."
              />
            </CardContent>
          </Card>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Gallery Images */}
          <Card>
            <CardContent className="p-6">
              <ImageGalleryUploader
                images={galleryImages}
                onImagesChange={handleGalleryImagesChange}
                onFeaturedImageChange={setFeaturedImageId}
                featuredImageId={featuredImageId}
              />
            </CardContent>
          </Card>
          
          {/* Featured Image Info */}
          {featuredImageId && (
            <Card>
              <CardContent className="p-6">
                <Label className="mb-2 block text-green-600">✓ Featured Image Selected</Label>
                <p className="text-sm text-gray-500">
                  The featured image will be shown in blog listings and as the main thumbnail.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Category */}
          <Card>
            <CardContent className="p-6">
              <Label>Category</Label>
              <Select
                value={categoryId?.toString()}
                onValueChange={(value) => setCategoryId(Number(value))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="p-6">
              <Label className="mb-2 block">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? 'bg-[#B11E43] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    #{tag.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="highlighted"
                  checked={isHighlighted}
                  onCheckedChange={(checked) => setIsHighlighted(!!checked)}
                />
                <Label htmlFor="highlighted" className="cursor-pointer">
                  Feature this blog (show on homepage)
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

