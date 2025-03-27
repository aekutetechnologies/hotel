import type { ActionResponse } from '@/types/actions'
import { API_URL } from '../config'

// Accept any property data, not just the full Property type
export async function createProperty(propertyData: any): Promise<ActionResponse<any>> {
  const response = await fetch(`${API_URL}property/properties/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(propertyData)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to create property')
  }

  return await response.json()
} 