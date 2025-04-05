import { API_URL } from '../config'
import { apiGet } from './apiClient'

/**
 * Fetches bookings for a specific user (admin function)
 * @param userId - The ID of the user to fetch bookings for
 * @returns Promise with the user's bookings
 */
export async function getUserBookings(userId: string) {
  console.log("fetching bookings")
  return await apiGet(`booking/bookings/user/${userId}`)
} 