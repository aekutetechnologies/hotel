'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, Calendar, Search, Filter } from 'lucide-react'
import { fetchBlogs } from '@/lib/api/fetchBlogs'
import { fetchBlogCategories } from '@/lib/api/fetchBlogCategories'
import { Blog, BlogCategory } from '@/types/blog'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { extractPlainTextFromLexical } from '@/lib/utils/lexicalToHtml'
import { LoadingIndicator } from '@/components/ui/LoadingIndicator'
import { LoginDialog } from '@/components/LoginDialog'

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)

  useEffect(() => {
    const storedName = localStorage.getItem("name")
    const storedAccessToken = localStorage.getItem("accessToken")
    
    if (storedName && storedAccessToken) {
      setIsLoggedIn(true)
      setUserName(storedName)
    }
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        const [blogsData, categoriesData] = await Promise.all([
          fetchBlogs(),
          fetchBlogCategories()
        ])
        setBlogs(blogsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to load blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    try {
      const data = await fetchBlogs({
        search: searchTerm,
        category: selectedCategory
      })
      setBlogs(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryFilter = async (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    setLoading(true)
    try {
      const data = await fetchBlogs({
        category: categorySlug || undefined,
        search: searchTerm || undefined
      })
      setBlogs(data)
    } catch (error) {
      console.error('Filter failed:', error)
    } finally {
      setLoading(false)
    }
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
          <LoadingIndicator variant="dots" size="lg" text="Loading blogs..." />
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
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#B11E43] to-[#8f1836] text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Insights, tips, and stories from the world of hospitality
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} className="bg-[#B11E43] hover:bg-[#8f1836]">
                  Search
                </Button>
              </div>
              
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'neutral'}
                  onClick={() => handleCategoryFilter('')}
                  size="sm"
                  className={selectedCategory === '' ? 'bg-[#B11E43] hover:bg-[#8f1836]' : ''}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.slug ? 'default' : 'neutral'}
                    onClick={() => handleCategoryFilter(category.slug)}
                    size="sm"
                    className={selectedCategory === category.slug ? 'bg-[#B11E43] hover:bg-[#8f1836]' : ''}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {blogs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No blogs found. Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <div key={blog.id} className="rounded-xl border border-gray-100 bg-white shadow-lg transition-shadow hover:shadow-xl overflow-hidden flex flex-col">
                  <Link href={`/blog/${blog.slug}`}>
                    <div className="relative h-48 w-full overflow-hidden">
                      {blog.featured_image?.image_url ? (
                        <Image
                          src={blog.featured_image.image_url}
                          alt={blog.featured_image.alt_text || blog.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#B11E43] to-[#8f1836] flex items-center justify-center">
                          <span className="text-white text-4xl font-bold">
                            {blog.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      {blog.category && (
                        <Badge className="absolute top-4 left-4 bg-[#B11E43] hover:bg-[#8f1836]">
                          {blog.category.name}
                        </Badge>
                      )}
                    </div>
                  </Link>

                  <div className="p-6 flex-grow flex flex-col">
                    <Link href={`/blog/${blog.slug}`}>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-[#B11E43] transition-colors line-clamp-2">
                        {blog.title}
                      </h2>
                    </Link>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                      {blog.content ? extractPlainTextFromLexical(blog.content) || 'No content available' : 'No content available'}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {blog.published_at && format(new Date(blog.published_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{blog.read_time} min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

