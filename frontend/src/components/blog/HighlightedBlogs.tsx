'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, ArrowRight, Calendar } from 'lucide-react'
import { fetchHighlightedBlogs } from '@/lib/api/fetchHighlightedBlogs'
import { Blog } from '@/types/blog'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'

interface HighlightedBlogsProps {
  type: 'hotel' | 'hostel'
}

export default function HighlightedBlogs({ type }: HighlightedBlogsProps) {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBlogs() {
      try {
        const data = await fetchHighlightedBlogs()
        setBlogs(data)
      } catch (err) {
        console.error('Failed to load highlighted blogs:', err)
        setError('Failed to load blogs')
      } finally {
        setLoading(false)
      }
    }

    loadBlogs()
  }, [])

  if (loading) {
    return (
      <div className="w-full py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Stories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Loading our latest insights and updates...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-xl" />
                <div className="bg-white p-6 rounded-b-xl">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || blogs.length === 0) {
    return null // Don't show section if there are no blogs or error
  }

  return (
    <section className="w-full py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Featured Stories
          </motion.h2>
          <motion.p 
            className="text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Discover insights, tips, and stories from our community
          </motion.p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-lg shadow-[0_8px_25px_rgba(0,0,0,0.15)] overflow-hidden hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] transition-all duration-300 h-full flex flex-col">
                {/* Dark Header - Compact like the image */}
                <div className="bg-[#B11E43] text-white p-5">
                  <h3 className="text-xl font-bold text-white mb-3">
                    {blog.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-white opacity-90">
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

                {/* White Content Area */}
                <div className="p-6 flex-grow flex flex-col">
                  {/* Featured Image - Prominent like in the image */}
                  {blog.featured_image?.image_url && (
                    <div className="relative h-56 w-full overflow-hidden rounded-lg mb-5">
                      <Image
                        src={blog.featured_image.image_url}
                        alt={blog.featured_image.alt_text || blog.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-base mb-5 line-clamp-3 flex-grow">
                    {blog.content ? blog.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : "Discover more about this topic and explore our latest insights."}
                  </p>

                  {/* CTA - Prominent like in the image */}
                  <Link href={`/blog/${blog.slug}`}>
                    <div className="text-[#B11E43] text-base font-medium hover:underline cursor-pointer flex items-center gap-2 underline">
                      Read more
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/blog">
            <Button 
              size="lg" 
              className="bg-[#B11E43] hover:bg-[#8f1836] text-white"
            >
              View All Stories
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

