import { apiClient } from './apiClient'
import { Blog, BlogFormData } from '@/types/blog'

export async function createBlog(data: BlogFormData): Promise<Blog> {
  return await apiClient<Blog>('blog/blogs/', {
    method: 'POST',
    body: data
  })
}

