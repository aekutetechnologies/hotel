import { apiGet } from './apiClient'
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