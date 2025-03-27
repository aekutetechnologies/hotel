import type { ActionResponse } from '@/types/actions'
import { API_URL } from '../config'

// Accept any property data, not just the full Property type
export async function editProperty(id: string, propertyData: any): Promise<ActionResponse<any>> {
  const response = await fetch(`${API_URL}property/properties/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // Include token in headers if necessary
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(propertyData)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to edit property')
  }

  return await response.json()
} 