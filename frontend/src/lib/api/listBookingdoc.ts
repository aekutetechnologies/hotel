import { apiGet } from './apiClient'
import { Document } from '@/app/admin/bookings/page'

/**
 * Lists documents for a booking
 * 
 * @param bookingId Booking ID to fetch documents for
 * @returns Promise with array of booking documents
 */
export async function listBookingDoc(bookingId: string): Promise<Document[]> {
  try {
    return await apiGet<Document[]>(`booking/bookings/${bookingId}/documents/`)
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 