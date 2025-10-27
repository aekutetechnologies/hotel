import { API_URL } from '../config'
import { Blog } from '@/types/blog'

export async function fetchHighlightedBlogs(): Promise<Blog[]> {
  const response = await fetch(`${API_URL}blog/blogs/highlighted/`)

  if (!response.ok) {
    throw new Error('Failed to fetch highlighted blogs')
  }

  return await response.json()
}

