import type { ActionResponse } from '@/types/actions'
import { API_URL } from '../config'

export async function fetchHotelPolicies() {
  const response = await fetch(`${API_URL}property/rules/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to fetch hotel policies')
  }

  return await response.json()
} 