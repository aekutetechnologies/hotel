import { API_URL } from '../config'

export interface OfferImage {
  id: number
  image: string
}

export async function listOfferimage(offerId: string): Promise<OfferImage[]> {
  const response = await fetch(`${API_URL}offers/offers/${offerId}/images/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch expense documents')
  }

  const data = await response.json()
  return data as OfferImage[]
} 