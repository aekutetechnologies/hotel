import { apiGet } from './apiClient'
import { Property } from '@/types/property'

/**
 * Fetches the list of properties
 * 
 * @returns Promise with array of properties
 */
export async function fetchProperties(): Promise<Property[]> {
  try {
    const userId = localStorage.getItem('userId')
    return await apiGet<Property[]>(`property/properties/?user=${userId}`)
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
}
