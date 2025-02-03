import type { ActionResponse } from '@/types/actions'
import { Property } from '@/types/property'
import { API_URL } from '../config'

export async function editProperty(id: string, property: Property): Promise<ActionResponse> {
  const response = await fetch(`${API_URL}/property/properties/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // Include token in headers if necessary
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(property)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to edit property')
  }

  return await response.json()
} 