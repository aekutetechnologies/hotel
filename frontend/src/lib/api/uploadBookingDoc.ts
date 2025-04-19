import { apiClient } from './apiClient'

/**
 * Uploads a document for a booking
 * 
 * @param bookingId Booking ID
 * @param bookingDoc File to upload
 * @returns Promise with document information
 */
export async function uploadBookingDoc(bookingId: string, bookingDoc: File): Promise<{ id: number, doc_url: string }> {
  // Create form data
  const formData = new FormData()
  formData.append('file', bookingDoc)

  try {
    // Custom API call for FormData
    return await apiClient(`booking/bookings/${bookingId}/documents/`, {
      method: 'POST',
      body: formData,
      isFormData: true // Use FormData flag to prevent Content-Type header and JSON.stringify
    })
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 