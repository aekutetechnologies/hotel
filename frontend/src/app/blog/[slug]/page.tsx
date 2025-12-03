'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, Eye, ArrowLeft, Share2 } from 'lucide-react'
import { fetchBlogBySlug } from '@/lib/api/fetchBlogBySlug'
import { fetchRelatedBlogs } from '@/lib/api/fetchRelatedBlogs'
import { Blog } from '@/types/blog'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { LoadingIndicator } from '@/components/ui/LoadingIndicator'
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
} from 'react-share'
import { lexicalToHtml } from '@/lib/utils/lexicalToHtml'
import { LoginDialog } from '@/components/LoginDialog'
import { SimilarBlogsCard } from '@/components/blog/SimilarBlogsCard'
import { BlogImageCarousel } from '@/components/blog/BlogImageCarousel'

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [blog, setBlog] = useState<Blog | null>(null)
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
  }, [])

  useEffect(() => {
    const storedName = localStorage.getItem("name")
    const storedAccessToken = localStorage.getItem("accessToken")
    
    if (storedName && storedAccessToken) {
      setIsLoggedIn(true)
      setUserName(storedName)
    }
  }, [])

  useEffect(() => {
    async function loadBlog() {
      try {
        const [blogData, related] = await Promise.all([
          fetchBlogBySlug(slug),
          fetchRelatedBlogs(slug).catch(() => []) // Graceful fallback for related blogs
        ])
        setBlog(blogData)
        setRelatedBlogs(related)
      } catch (err) {
        console.error('Failed to load blog:', err)
        setError('Blog not found')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadBlog()
    }
  }, [slug])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    alert('Link copied to clipboard!')
  }

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar
          isLoggedIn={isLoggedIn}
          userName={userName}
          handleLogout={handleLogout}
          handleLoginClick={handleLoginClick}
          setShowDetailSection={setShowDetailSection}
          isClosed={false}
          currentSection="hotels"
        />
        <main className="flex-grow flex items-center justify-center">
          <LoadingIndicator variant="dots" size="lg" text="Loading blog..." />
        </main>
        <Footer sectionType="hotels" />
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar
          isLoggedIn={isLoggedIn}
          userName={userName}
          handleLogout={handleLogout}
          handleLoginClick={handleLoginClick}
          setShowDetailSection={setShowDetailSection}
          isClosed={false}
          currentSection="hotels"
        />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
            <p className="text-gray-600 mb-6">The blog you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button className="bg-[#B11E43] hover:bg-[#8f1836]">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Button>
            </Link>
          </div>
        </main>
        <Footer sectionType="hotels" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isLoggedIn={isLoggedIn}
        userName={userName}
        handleLogout={handleLogout}
        handleLoginClick={handleLoginClick}
        setShowDetailSection={setShowDetailSection}
        isClosed={false}
        currentSection="hotels"
      />
      
      <main className="flex-grow">
        {/* Back Button */}
        {/* <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Button>
            </Link>
          </div>
        </div> */}

        {/* Main Content with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Main Article Content */}
            <article className="min-w-0">
              {/* Category Badge */}
              {blog.category && (
                <Badge className="mb-4 bg-[#B11E43] hover:bg-[#8f1836]">
                  {blog.category.name}
                </Badge>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {blog.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-[#B11E43] flex items-center justify-center text-white font-semibold">
                    {blog.author.name.charAt(0)}
                  </div>
                  <span className="font-medium">{blog.author.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{blog.published_at && format(new Date(blog.published_at), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{blog.read_time} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{blog.views_count} views</span>
                </div>
              </div>

              {/* Images Carousel */}
              {blog.images && blog.images.filter(img => img.image_url).length > 0 ? (
                <BlogImageCarousel 
                  images={blog.images.filter(img => img.image_url) as any}
                  autoSlide={true}
                  slideInterval={5000}
                  className="mb-8"
                />
              ) : blog.featured_image?.image_url ? (
                <div className="relative h-96 w-full rounded-xl overflow-hidden mb-8">
                  <Image
                    src={blog.featured_image.image_url}
                    alt={blog.featured_image.alt_text || blog.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : null}

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: lexicalToHtml(blog.content) }}
              />

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {blog.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Share Buttons */}
              <div className="border-t border-b py-6 mb-12">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900 flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Share this post:
                  </span>
                  <div className="flex gap-2">
                    <FacebookShareButton url={shareUrl} title={blog.title}>
                      <FacebookIcon size={32} round />
                    </FacebookShareButton>
                    <TwitterShareButton url={shareUrl} title={blog.title}>
                      <TwitterIcon size={32} round />
                    </TwitterShareButton>
                    <LinkedinShareButton url={shareUrl} title={blog.title}>
                      <LinkedinIcon size={32} round />
                    </LinkedinShareButton>
                    <WhatsappShareButton url={shareUrl} title={blog.title}>
                      <WhatsappIcon size={32} round />
                    </WhatsappShareButton>
                    <Button
                      variant="neutral"
                      size="icon"
                      onClick={copyToClipboard}
                      className="rounded-full h-8 w-8"
                      title="Copy link"
                    >
                      📋
                    </Button>
                  </div>
                </div>
              </div>

            </article>

            {/* Sidebar - Desktop Only */}
            {relatedBlogs.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Related Blogs</h2>
                  <div className="space-y-4">
                    {relatedBlogs.map((relatedBlog) => (
                      <SimilarBlogsCard key={relatedBlog.id} blog={relatedBlog} />
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </div>

          {/* Related Blogs - Mobile Only */}
          {relatedBlogs.length > 0 && (
            <div className="lg:hidden mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Blogs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <div key={relatedBlog.id} className="rounded-xl border border-gray-100 bg-white shadow-lg transition-shadow hover:shadow-xl overflow-hidden">
                    <Link href={`/blog/${relatedBlog.slug}`}>
                      <div className="relative h-40 w-full">
                        {relatedBlog.featured_image?.image_url ? (
                          <Image
                            src={relatedBlog.featured_image.image_url}
                            alt={relatedBlog.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#B11E43] to-[#8f1836] flex items-center justify-center">
                            <span className="text-white text-3xl font-bold">
                              {relatedBlog.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/blog/${relatedBlog.slug}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-[#B11E43] mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.2em', maxHeight: '2.4em' }}>
                          {relatedBlog.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.2em', maxHeight: '2.4em' }}>
                        {relatedBlog.content ? relatedBlog.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No content available'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer sectionType="hotels" />
      
      <LoginDialog 
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}

