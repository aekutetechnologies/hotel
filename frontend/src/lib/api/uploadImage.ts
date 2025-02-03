import { API_URL } from '../config'

export async function uploadImage(imageFile: File): Promise<{ id: number, image_url: string }> {
  const formData = new FormData()
  formData.append('image', imageFile)

  const response = await fetch(`${API_URL}property/images/upload/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Image upload failed: ${JSON.stringify(error)}`)
  }

  return await response.json() as { id: number, image_url: string }
} 