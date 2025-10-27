'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye } from 'lucide-react'
import { Blog } from '@/types/blog'
import Image from 'next/image'
import Link from 'next/link'

interface SimilarBlogsCardProps {
  blog: Blog
}

export function SimilarBlogsCard({ blog }: SimilarBlogsCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <Link href={`/blog/${blog.slug}`}>
        <div className="relative h-32 w-full">
          {blog.featured_image?.image_url ? (
            <Image
              src={blog.featured_image.image_url}
              alt={blog.featured_image.alt_text || blog.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#B11E43] to-[#8f1836] flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {blog.title.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </Link>
      
      <CardContent className="p-3">
        <Link href={`/blog/${blog.slug}`}>
          <h3 className="font-semibold text-gray-900 hover:text-[#B11E43] mb-2 text-sm leading-tight group-hover:text-[#B11E43] transition-colors overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.2em', maxHeight: '2.4em' }}>
            {blog.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{blog.read_time} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{blog.views_count}</span>
          </div>
        </div>
        
        {blog.category && (
          <Badge 
            variant="outline" 
            className="text-xs bg-[#B11E43]/10 text-[#B11E43] border-[#B11E43]/20 hover:bg-[#B11E43]/20"
          >
            {blog.category.name}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
