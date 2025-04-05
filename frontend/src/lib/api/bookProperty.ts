import { apiPost } from './apiClient'

interface BookPropertyParams {
  property?: number;
  room: number;
  user?: string | null;
  checkin_date: string;
  checkout_date: string;
  status: string;
  discount: number;
  price: number;
  booking_type: string;
  booking_time: string;
  payment_type: string;
  number_of_guests: number;
  number_of_rooms: number;
  token?: string;
}

/**
 * Books a property using the provided booking details
 * 
 * @param params Booking parameters
 * @returns Promise with booking response
 */
export async function bookProperty(params: BookPropertyParams) {
  const { token, ...bookingData } = params
  
  try {
    return await apiPost('booking/bookings/', bookingData)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 