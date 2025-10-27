'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { createBlog } from '@/lib/api/createBlog'
import { fetchBlogCategories } from '@/lib/api/fetchBlogCategories'
import { fetchBlogTags } from '@/lib/api/fetchBlogTags'
import { BlogCategory, BlogTag } from '@/types/blog'
import { ImageGalleryUploader } from '@/components/blog/ImageGalleryUploader'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { usePermissions } from '@/hooks/usePermissions'

export default function NewBlogPage() {
  const router = useRouter()
  const { can, isLoaded } = usePermissions()
  
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [featuredImageId, setFeaturedImageId] = useState<number | null>(null)
  const [galleryImages, setGalleryImages] = useState<{ id: number; image_url: string; alt_text?: string }[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [isHighlighted, setIsHighlighted] = useState(false)

  
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && !can('blog:create')) {
      toast.error('You do not have permission to create blogs')
      router.push('/admin/blogs')
    }
  }, [isLoaded, can, router])

  useEffect(() => {
    loadFormData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setSlug(generatedSlug)
    }
  }, [title])

  const loadFormData = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        fetchBlogCategories(),
        fetchBlogTags()
      ])
      setCategories(categoriesData)
      setTags(tagsData)
    } catch (error) {
      console.error('Failed to load form data:', error)
      toast.error('Failed to load categories and tags')
    }
  }

  const handleGalleryImagesChange = (updatedImages: { id: number; image_url: string; alt_text?: string }[]) => {
    setGalleryImages(updatedImages)
  }

  const handleSubmit = async (publish: boolean) => {
    if (!can('blog:create')) {
      toast.error('You do not have permission to create blogs')
      return
    }

    if (publish && !can('blog:publish')) {
      toast.error('You do not have permission to publish blogs')
      return
    }

    if (!title || !content) {
      toast.error('Title and content are required')
      return
    }

    try {
      setLoading(true)
      await createBlog({
        title,
        slug: slug || undefined,
        content,
        category_id: categoryId,
        featured_image_id: featuredImageId,
        image_ids: galleryImages.map(img => img.id),
        tag_ids: selectedTagIds,
        is_highlighted: isHighlighted,
        is_published: publish,
      })
      toast.success(publish ? 'Blog published successfully' : 'Blog saved as draft')
      router.push('/admin/blogs')
    } catch (error) {
      console.error('Failed to create blog:', error)
      toast.error('Failed to create blog')
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
            <p className="text-gray-600">Write and publish your blog post</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="neutral"
            onClick={() => handleSubmit(false)}
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          {can('blog:publish') && (
            <Button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="bg-[#B11E43] hover:bg-[#8f1836]"
            >
              <Eye className="mr-2 h-4 w-4" />
              Publish
            </Button>
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
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated-from-title"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /blog/{slug || 'your-blog-slug'}
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

