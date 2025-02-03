import type { ActionResponse } from '@/types/actions'
import { Property } from '@/types/property'
import { API_URL } from '../config'

export async function createProperty(property: Property): Promise<ActionResponse> {
  const response = await fetch(`${API_URL}property/properties/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(property)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to create property')
  }

  return await response.json()
} 