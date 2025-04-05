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
      headers: {
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData
    })
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 