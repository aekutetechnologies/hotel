import { API_URL } from '../config'
import { apiClient } from './apiClient'

/**
 * Uploads an image for a specific offer
 * @param offerId - The ID of the offer to upload an image for
 * @param imageFile - The image file to upload
 * @returns Promise with the uploaded image ID and URL
 */
export async function uploadOfferImage(offerId: number, imageFile: File): Promise<{ id: number, image_url: string }> {
  // Create FormData for file upload
  const formData = new FormData()
  formData.append('image', imageFile)

  // When using FormData, let the browser set the Content-Type header automatically
  // We need to make a direct apiClient call rather than apiPost as we need custom handling for FormData
  return await apiClient<{ id: number, image_url: string }>(
    `offers/offer-images/${offerId}/`, 
    {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }
  )
} 