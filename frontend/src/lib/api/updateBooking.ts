import { API_URL } from '../config'

interface Booking {
  id: string;
  status: string;
}

export async function updateBooking(booking: Booking) {
  const response = await fetch(`${API_URL}booking/bookings/${booking.id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(booking)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to update booking')
  }

  return await response.json()
} 