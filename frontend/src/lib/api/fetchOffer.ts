import { apiGet } from './apiClient'

/**
 * Fetches offer by ID
 * 
 * @param id Offer ID to fetch
 * @returns Promise with offer data
 */
export async function fetchOffer(id: string) {
  try {
    return await apiGet(`offers/offers/${id}/`)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 