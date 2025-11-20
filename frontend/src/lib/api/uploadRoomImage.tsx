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
  console.log('FormData created with image file:', imageFile.name, imageFile.type, imageFile.size)

  try {
    // Use apiClient to get automatic token refresh support
    const result = await apiClient<{ id: number, image_url: string }>('property/room/images/upload/', {
      method: 'POST',
      body: formData,
      isFormData: true
    })
    
    console.log('Room image upload successful:', result)
    return result
  } catch (error) {
    console.error('Room image upload error:', error)
    throw error
  }
} 