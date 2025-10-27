import { API_URL } from '../config'
import { Blog } from '@/types/blog'

export async function fetchBlogBySlug(slug: string): Promise<Blog> {
  const response = await fetch(`${API_URL}blog/blogs/${slug}/`)

  if (!response.ok) {
    throw new Error('Failed to fetch blog')
  }

  return await response.json()
}

