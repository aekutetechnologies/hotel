import { apiPut } from './apiClient'
import { ImageCategory } from '@/types/property'

interface UpdatePropertyImagePayload {
  category?: number | null
}

export interface PropertyImageResponse {
  id: number
  image: string
  category?: ImageCategory | null
  category_detail?: ImageCategory | null
  category_id?: number | null
  category_name?: string | null
  category_code?: string | null
}

export async function updatePropertyImage(id: number, payload: UpdatePropertyImagePayload): Promise<PropertyImageResponse> {
  return apiPut<PropertyImageResponse>(`property/images/${id}/`, payload)
}

