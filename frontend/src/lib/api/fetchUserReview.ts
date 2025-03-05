import { API_URL } from '../config'

export async function getUserBookings(propertyId: string) {
    console.log("fetching reviews")
  const response = await fetch(`${API_URL}property/reviews/user/${propertyId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to fetch reviews')
  }

  return await response.json()
} 