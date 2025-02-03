import { API_URL } from '../config'

export async function fetchBookings() {
    console.log("fetching bookings")
  const response = await fetch(`${API_URL}booking/bookings/`, {
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