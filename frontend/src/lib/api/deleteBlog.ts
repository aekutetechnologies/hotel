import { apiClient } from './apiClient'

export async function deleteBlog(slug: string): Promise<void> {
  await apiClient(`blog/blogs/${slug}/`, {
    method: 'DELETE'
  })
}

