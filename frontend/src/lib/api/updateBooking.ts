import { apiPut } from './apiClient'

interface UpdateBookingParams {
  id: number;
  [key: string]: any;
}

/**
 * Updates a booking
 * 
 * @param booking Booking data with id and other fields to update
 * @returns Promise with updated booking data
 */
export async function updateBooking(booking: UpdateBookingParams) {
  const { id, ...updateData } = booking
  
  try {
    return await apiPut(`booking/bookings/${id}/`, updateData)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 