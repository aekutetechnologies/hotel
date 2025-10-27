import { API_URL } from '../config'
import { Blog, BlogFormData } from '@/types/blog'

export async function updateBlog(slug: string, data: Partial<BlogFormData>): Promise<Blog> {
  const response = await fetch(`${API_URL}blog/blogs/${slug}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to update blog: ${JSON.stringify(error)}`)
  }

  return await response.json()
}

