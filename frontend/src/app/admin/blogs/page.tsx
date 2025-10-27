'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Edit, 
  Trash, 
  Eye, 
  Search, 
  CheckCircle2, 
  XCircle,
  Clock
} from 'lucide-react'
import { fetchBlogs } from '@/lib/api/fetchBlogs'
import { deleteBlog } from '@/lib/api/deleteBlog'
import { updateBlog } from '@/lib/api/updateBlog'
import { Blog } from '@/types/blog'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import Link from 'next/link'
import Image from 'next/image'
import { usePermissions } from '@/hooks/usePermissions'

export default function AdminBlogsPage() {
  const { can, isLoaded } = usePermissions()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')

  useEffect(() => {
    loadBlogs()
  }, [])

  useEffect(() => {
    filterBlogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogs, searchTerm, statusFilter])

  const loadBlogs = async () => {
    try {
      setLoading(true)
      // Fetch all blogs (admin view, including drafts)
      const data = await fetchBlogs(undefined, true)
      setBlogs(data)
    } catch (error) {
      console.error('Failed to load blogs:', error)
      toast.error('Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  const filterBlogs = () => {
    let filtered = [...blogs]

    // Status filter
    if (statusFilter === 'published') {
      filtered = filtered.filter(blog => blog.is_published)
    } else if (statusFilter === 'draft') {
      filtered = filtered.filter(blog => !blog.is_published)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredBlogs(filtered)
  }

  const handleDelete = async (slug: string, title: string) => {
    if (!can('blog:delete')) {
      toast.error('You do not have permission to delete blogs')
      return
    }

    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    try {
      await deleteBlog(slug)
      toast.success('Blog deleted successfully')
      loadBlogs()
    } catch (error) {
      console.error('Failed to delete blog:', error)
      toast.error('Failed to delete blog')
    }
  }

  const togglePublish = async (blog: Blog) => {
    if (!can('blog:publish')) {
      toast.error('You do not have permission to publish/unpublish blogs')
      return
    }

    try {
      await updateBlog(blog.slug, { is_published: !blog.is_published })
      toast.success(blog.is_published ? 'Blog unpublished' : 'Blog published')
      loadBlogs()
    } catch (error) {
      console.error('Failed to update blog:', error)
      toast.error('Failed to update blog status')
    }
  }

  const toggleHighlight = async (blog: Blog) => {
    if (!can('blog:edit')) {
      toast.error('You do not have permission to edit blogs')
      return
    }

    try {
      await updateBlog(blog.slug, { is_highlighted: !blog.is_highlighted })
      toast.success(blog.is_highlighted ? 'Removed from highlights' : 'Added to highlights')
      loadBlogs()
    } catch (error) {
      console.error('Failed to update blog:', error)
      toast.error('Failed to update highlight status')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-1">Manage your blog posts and content</p>
        </div>
        {can('blog:create') && (
          <Link href="/admin/blogs/new">
            <Button className="bg-[#B11E43] hover:bg-[#8f1836]">
              <Plus className="mr-2 h-4 w-4" />
              Create New Blog
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'neutral'}
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-[#B11E43] hover:bg-[#8f1836]' : ''}
              >
                All ({blogs.length})
              </Button>
              <Button
                variant={statusFilter === 'published' ? 'default' : 'neutral'}
                onClick={() => setStatusFilter('published')}
                className={statusFilter === 'published' ? 'bg-[#B11E43] hover:bg-[#8f1836]' : ''}
              >
                Published ({blogs.filter(b => b.is_published).length})
              </Button>
              <Button
                variant={statusFilter === 'draft' ? 'default' : 'neutral'}
                onClick={() => setStatusFilter('draft')}
                className={statusFilter === 'draft' ? 'bg-[#B11E43] hover:bg-[#8f1836]' : ''}
              >
                Drafts ({blogs.filter(b => !b.is_published).length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blog List */}
      {filteredBlogs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No blogs found</p>
            {can('blog:create') && (
              <Link href="/admin/blogs/new">
                <Button className="bg-[#B11E43] hover:bg-[#8f1836]">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Blog
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Thumbnail */}
                  <div className="w-32 h-32 flex-shrink-0">
                    {blog.featured_image?.image_url ? (
                      <Image
                        src={blog.featured_image.image_url}
                        alt={blog.title}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#B11E43] to-[#8f1836] rounded-lg flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">
                          {blog.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                          {blog.title}
                        </h2>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {blog.excerpt}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {blog.is_published ? (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <XCircle className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                        {blog.is_highlighted && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">
                            ⭐ Highlighted
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      {blog.category && (
                        <span className="flex items-center gap-1">
                          📁 {blog.category.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {blog.published_at ? format(new Date(blog.published_at), 'MMM d, yyyy') : 'Not published'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {blog.views_count} views
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {can('blog:edit') && (
                        <Link href={`/admin/blogs/${blog.slug}/edit`}>
                          <Button size="sm" variant="neutral">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      )}
                      <Link href={`/blog/${blog.slug}`} target="_blank">
                        <Button size="sm" variant="neutral">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      {can('blog:publish') && (
                        <Button
                          size="sm"
                          variant="neutral"
                          onClick={() => togglePublish(blog)}
                        >
                          {blog.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                      )}
                      {can('blog:edit') && (
                        <Button
                          size="sm"
                          variant="neutral"
                          onClick={() => toggleHighlight(blog)}
                        >
                          {blog.is_highlighted ? 'Remove Highlight' : 'Highlight'}
                        </Button>
                      )}
                      {can('blog:delete') && (
                        <Button
                          size="sm"
                          variant="neutral"
                          onClick={() => handleDelete(blog.slug, blog.title)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

