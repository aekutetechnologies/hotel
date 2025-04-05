import { apiGet } from './apiClient'
import { Booking } from '@/types/booking'

/**
 * Fetches bookings for the current logged-in user
 * @returns Promise with the user's bookings
 */
export async function getUserBookings(): Promise<Booking[]> {
  try {
    return await apiGet<Booking[]>('booking/bookings/user/')
  } catch (error) {
    throw error
  }
} 