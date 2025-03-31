import { API_URL } from '../config'

export async function fetchFavouriteProperties() {
  const response = await fetch(`${API_URL}property/favorite-properties/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch favorite properties`)
  }

  return await response.json()
} 