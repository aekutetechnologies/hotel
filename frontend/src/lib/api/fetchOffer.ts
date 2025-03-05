
import { API_URL } from '../config'

export async function fetchOffer(offerId: string) {
  const response = await fetch(`${API_URL}offers/offers/${offerId}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to fetch offer')
  }

  return await response.json()
} 