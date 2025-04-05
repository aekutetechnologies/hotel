import { apiGet } from './apiClient'
import { Property } from '@/types/property'

/**
 * Fetches the list of properties
 * 
 * @returns Promise with array of properties
 */
export async function fetchProperties(): Promise<Property[]> {
  try {
    return await apiGet<Property[]>('property/properties/')
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
}
