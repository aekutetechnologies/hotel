import type { ActionResponse } from '@/types/actions'
import { API_URL } from '../config'

export async function deleteProperty(id: string): Promise<ActionResponse<any, any>> {
  const response = await fetch(`${API_URL}property/properties/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete property' }))
    throw new Error(errorData.message || 'Failed to delete property')
  }

  return {
    data: null,
    error: null
  }
} 