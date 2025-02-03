
import { API_URL } from '../config'

export async function uploadBookingDoc(bookingId: string, bookingDoc: File): Promise<{ id: number, doc_url: string }> {
  const formData = new FormData()
  formData.append('file', bookingDoc)

  const response = await fetch(`${API_URL}booking/bookings/${bookingId}/documents/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Image upload failed: ${JSON.stringify(error)}`)
  }

  return await response.json() as { id: number, doc_url: string }
} 