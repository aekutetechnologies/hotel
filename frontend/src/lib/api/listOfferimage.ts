import { apiClient } from './apiClient'

export interface OfferImage {
  id: number
  image: string
}

export async function listOfferimage(offerId: string): Promise<OfferImage[]> {
  return await apiClient<OfferImage[]>(`offers/offers/${offerId}/images/`)
} 