import { API_URL } from '../config'


export async function updateOffer(offer: Offer, offerId: number) {
  const response = await fetch(`${API_URL}offers/offers/${offerId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(offer)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to update offer')
  }

  return await response.json()
} 