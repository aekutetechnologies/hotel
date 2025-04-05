import { apiPut } from './apiClient'

interface Booking {
  id: string;
  status: string;
}

/**
 * Updates the status of a booking
 * 
 * @param booking Booking data with id and status
 * @returns Promise with updated booking data
 */
export async function updateStatusBooking(booking: Booking) {
  try {
    return await apiPut(`booking/bookings/${booking.id}/status/`, booking)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 