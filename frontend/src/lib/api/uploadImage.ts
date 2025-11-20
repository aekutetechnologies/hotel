import { apiClient } from './apiClient'
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

  return await apiClient<UploadImageResponse>('property/images/upload/', {
    method: 'POST',
    body: formData,
    isFormData: true
  })
} 