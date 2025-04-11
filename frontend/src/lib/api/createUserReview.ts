import { apiPost } from './apiClient'

interface UserReviewData {
  booking_id: number;
  rating: number;
  review: string;
  property: number;
}

/**
 * Creates a new user review
 * 
 * @param review User review data to create
 * @returns Promise with created user review data
 */
export async function createUserReview(review: UserReviewData) {
  try {

    // Make the API call with FormData using apiClient
    const response = await apiPost('property/reviews/create/', review)

    console.log('API Response:', response)
    return response
  } catch (error) {
    console.error('Error in createUserReview:', error)
    throw error
  }
} 