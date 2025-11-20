import { apiClient } from './apiClient'
import { Blog, BlogFormData } from '@/types/blog'

export async function updateBlog(slug: string, data: Partial<BlogFormData>): Promise<Blog> {
  return await apiClient<Blog>(`blog/blogs/${slug}/`, {
    method: 'PUT',
    body: data
  })
}

