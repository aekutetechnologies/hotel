import { API_URL } from '../config'
import { BlogCategory } from '@/types/blog'

export async function fetchBlogCategories(): Promise<BlogCategory[]> {
  const response = await fetch(`${API_URL}blog/categories/`)

  if (!response.ok) {
    throw new Error('Failed to fetch blog categories')
  }

  return await response.json()
}

