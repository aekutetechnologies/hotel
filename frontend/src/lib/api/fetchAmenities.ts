import { apiGet, apiPost, apiPut, apiDelete } from './apiClient'
import { Amenity } from '@/types/property'

/**
 * Fetches all amenities
 * 
 * @returns Promise with list of amenities
 */
export async function fetchAmenities(): Promise<Amenity[]> {
  try {
    return await apiGet<Amenity[]>('property/amenities/')
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 

export async function createAmenity(name: string): Promise<Amenity> {
  return apiPost<Amenity>('property/amenities/', { name })
}

export async function updateAmenity(id: number, name: string): Promise<Amenity> {
  return apiPut<Amenity>(`property/amenities/${id}/`, { name })
}

export async function deleteAmenity(id: number): Promise<void> {
  await apiDelete(`property/amenities/${id}/`)
}