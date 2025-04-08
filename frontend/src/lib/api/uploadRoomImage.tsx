import { API_URL } from '../config'

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
    // Use fetch directly instead of apiClient to properly handle FormData
    const response = await fetch(`${API_URL}property/room/images/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        // Note: Do NOT set Content-Type header when sending FormData
        // Browser will automatically set the correct multipart boundary
      },
      body: formData
    })

    if (!response.ok) {
      // Get error details
      let errorDetail = ''
      try {
        const errorData = await response.json()
        errorDetail = JSON.stringify(errorData)
      } catch (e) {
        errorDetail = await response.text()
      }
      throw new Error(`Room image upload failed: ${response.status} ${response.statusText} - ${errorDetail}`)
    }

    // Parse and return response
    const result = await response.json()
    console.log('Room image upload successful:', result)
    return result as { id: number, image_url: string }
  } catch (error) {
    console.error('Room image upload error:', error)
    throw error
  }
} 