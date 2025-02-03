import { API_URL } from '../config'

export interface BookingDocument {
  id: number
  document: string
}

export async function listBookingDoc(bookingId: string): Promise<BookingDocument[]> {
  const response = await fetch(`${API_URL}booking/bookings/${bookingId}/documents/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch booking documents')
  }

  const data = await response.json()
  return data as BookingDocument[]
} 