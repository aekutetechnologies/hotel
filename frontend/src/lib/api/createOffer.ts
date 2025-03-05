import type { ActionResponse } from '@/types/actions'
import { Offer } from '@/types/offer'
import { API_URL } from '../config'

export async function createOffer(offer: Offer): Promise<ActionResponse> {
  const response = await fetch(`${API_URL}offers/offers/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(offer)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to create offer')
  }

  return await response.json()
} 