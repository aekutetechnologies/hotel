import { apiGet } from './apiClient'
import { type Offer } from '@/types/offer'

/**
 * Fetches all offers
 * 
 * @returns Promise with offers data
 */
export async function fetchOffers(): Promise<Offer[]> {
  try {
    return await apiGet<Offer[]>('offers/offers/')
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 