import { API_URL } from '../config'
import { apiGet } from './apiClient'

/**
 * Fetches reviews for a specific property that were written by the current user
 * @param propertyId - The ID of the property to get reviews for
 * @returns Promise with the user's reviews for the specified property
 */
export async function getUserReviews(propertyId: string) {
  console.log("fetching reviews")
  return await apiGet(`property/reviews/user/${propertyId}`)
} 