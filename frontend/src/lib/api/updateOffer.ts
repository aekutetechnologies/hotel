import { apiPut } from './apiClient'
import { type Offer } from '@/types/offer'

/**
 * Updates an offer
 * 
 * @param id ID of the offer to update
 * @param updateData Data fields to update
 * @returns Promise with updated offer data
 */
export async function updateOffer(
  id: number | string, 
  updateData: Partial<Offer>
): Promise<Offer> {
  try {
    return await apiPut<Offer>(`offers/offers/${id}/`, updateData)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 