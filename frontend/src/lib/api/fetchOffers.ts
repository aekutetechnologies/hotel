
import { API_URL } from '../config'

export async function fetchOffers() {
  const response = await fetch(`${API_URL}offers/offers/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to fetch offers')
  }

  return await response.json()
} 