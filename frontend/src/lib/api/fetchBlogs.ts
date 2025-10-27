import { API_URL } from '../config'
import { Blog, BlogFilters } from '@/types/blog'

export async function fetchBlogs(filters?: BlogFilters, includeAll?: boolean): Promise<Blog[]> {
  const params = new URLSearchParams()
  
  if (filters?.category) params.append('category', filters.category)
  if (filters?.tag) params.append('tag', filters.tag)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.highlighted !== undefined) params.append('highlighted', filters.highlighted.toString())
  if (includeAll) params.append('all', 'true')

  const queryString = params.toString() ? `?${params.toString()}` : ''
  
  const response = await fetch(`${API_URL}blog/blogs/${queryString}`)

  if (!response.ok) {
    throw new Error('Failed to fetch blogs')
  }

  return await response.json()
}

