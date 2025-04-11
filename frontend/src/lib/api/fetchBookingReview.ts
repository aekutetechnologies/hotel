import { apiGet } from './apiClient'

interface BookingReview {
  id: number;
  user: {
    name: string;
  };
  rating: number;
  review: string;
  created_at: string;
  images?: string[];
  property: number;
  booking: number;
}

/**
 * Fetches a review for a specific booking
 * @param bookingId - The ID of the booking to get the review for
 * @returns Promise with the review for the booking
 */
export async function getBookingReview(bookingId: number): Promise<BookingReview | null> {
  try {
    return await apiGet<BookingReview>(`property/reviews/booking/${bookingId}/`)
  } catch (error) {
    console.error('Error fetching booking review:', error)
    return null
  }
} 