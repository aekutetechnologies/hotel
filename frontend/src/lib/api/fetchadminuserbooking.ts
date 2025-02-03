import { API_URL } from '../config'

export async function getUserBookings(userId: string) {
    console.log("fetching bookings")
  const response = await fetch(`${API_URL}booking/bookings/user/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to fetch amenities')
  }

  return await response.json()
} 