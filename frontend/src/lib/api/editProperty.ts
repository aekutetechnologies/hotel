import { apiPut } from './apiClient'
import { Property } from '@/types/property'

/**
 * Updates an existing property
 * 
 * @param id Property ID to update
 * @param property Property data to update
 * @returns Promise with updated property data
 */
export async function editProperty(id: string | number, property: Partial<Property>) {
  try {
    return await apiPut(`property/properties/${id}/`, property)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 