import { API_URL } from '../config'

export async function deleteBookingDoc(documentId: string): Promise<string> {
  const response = await fetch(`${API_URL}booking/bookings/documents/${documentId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  console.log(response)

  if (response.ok) {
    if (response.status === 204) {
      return "Document deleted successfully"
    } else {
      return "Failed to delete booking document"
    }
  } else {
    throw new Error('Failed to delete booking document');
  }
}