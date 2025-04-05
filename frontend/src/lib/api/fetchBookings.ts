import { apiGet } from './apiClient'
import { Booking } from '@/app/admin/bookings/page'

/**
 * Fetches all bookings
 * 
 * @returns Promise with bookings data
 */
export async function fetchBookings(): Promise<Booking[]> {
  console.log("Fetching bookings")
  
  try {
    return await apiGet<Booking[]>('booking/bookings/')
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 