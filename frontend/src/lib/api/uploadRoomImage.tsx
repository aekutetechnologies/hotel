import { apiClient } from './apiClient'

/**
 * Uploads a room image
 * 
 * @param imageFile File to upload
 * @returns Promise with image ID and URL
 */
export async function uploadRoomImage(imageFile: File): Promise<{ id: number, image_url: string }> {
  // Create form data
  const formData = new FormData()
  formData.append('image', imageFile)

  try {
    // Custom API call for FormData
    return await apiClient<{ id: number, image_url: string }>('property/room/images/upload/', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData
    })
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 