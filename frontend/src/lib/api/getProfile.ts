import { API_URL } from '../config'
import type { ActionResponse } from '@/types/actions'

export async function getProfile(): Promise<ActionResponse> {
  const response = await fetch(`${API_URL}users/profile/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to fetch profile')
  }
  return await response.json()
} 