import { API_URL } from '../config'
import { ImageCategory } from '@/types/property'

export interface UploadImageResponse {
  id: number
  image_url: string
  category?: ImageCategory | null
  category_id?: number | null
}

export async function uploadImage(imageFile: File, categoryId?: number | null): Promise<UploadImageResponse> {
  const formData = new FormData()
  formData.append('image', imageFile)
  if (typeof categoryId === 'number') {
    formData.append('category', String(categoryId))
  }

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

  return await response.json() as UploadImageResponse
} 