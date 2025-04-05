import { apiPost } from './apiClient'

interface OfferData {
  title: string;
  description: string;
  discount_percentage: number;
  code: string;
  offer_start_date: string;
  offer_end_date: string;
  is_active: boolean;
  [key: string]: any;
}

/**
 * Creates a new offer
 * 
 * @param offer Offer data to create
 * @returns Promise with created offer data
 */
export async function createOffer(offer: OfferData) {
  try {
    return await apiPost('offers/offers/', offer)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 