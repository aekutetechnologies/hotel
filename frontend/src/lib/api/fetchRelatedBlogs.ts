import { API_URL } from '../config'
import { Blog } from '@/types/blog'

export async function fetchRelatedBlogs(slug: string): Promise<Blog[]> {
  const response = await fetch(`${API_URL}blog/blogs/${slug}/related/`)

  if (!response.ok) {
    throw new Error('Failed to fetch related blogs')
  }

  return await response.json()
}

