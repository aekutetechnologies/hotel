import { API_URL } from '../config'
import { BlogTag } from '@/types/blog'

export async function fetchBlogTags(): Promise<BlogTag[]> {
  const response = await fetch(`${API_URL}blog/tags/`)

  if (!response.ok) {
    throw new Error('Failed to fetch blog tags')
  }

  return await response.json()
}

