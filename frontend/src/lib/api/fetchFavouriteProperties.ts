import { apiGet } from './apiClient'

/**
 * Fetches user's favorite properties
 * 
 * @returns Promise with favorite properties
 */
export async function fetchFavouriteProperties() {
  try {
    return await apiGet('property/favorites/')
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 