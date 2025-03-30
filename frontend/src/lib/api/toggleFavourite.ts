import { API_URL } from '../config'


export async function toggleFavourite(propertyId: string, isFavourite: boolean) {
  const response = await fetch(`${API_URL}/property/toggle-favourite/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify({ property_id: propertyId, is_favourite: isFavourite })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to update favourite')
  }

  return await response.json()
} 