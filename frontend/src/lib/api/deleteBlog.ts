import { API_URL } from '../config'

export async function deleteBlog(slug: string): Promise<void> {
  const response = await fetch(`${API_URL}blog/blogs/${slug}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to delete blog')
  }
}

