import { apiDelete, apiGet, apiPost, apiPut } from './apiClient'
import { ImageCategory } from '@/types/property'

export async function fetchImageCategories(): Promise<ImageCategory[]> {
  try {
    return await apiGet<ImageCategory[]>('property/image-categories/')
  } catch (error) {
    return []
  }
}

export async function createImageCategory(name: string): Promise<ImageCategory> {
  return apiPost<ImageCategory>('property/image-categories/', { name })
}

export async function updateImageCategory(id: number, name: string): Promise<ImageCategory> {
  return apiPut<ImageCategory>(`property/image-categories/${id}/`, { name })
}

export async function deleteImageCategory(id: number): Promise<void> {
  await apiDelete(`property/image-categories/${id}/`)
}

