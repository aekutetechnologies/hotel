import { apiDelete } from './apiClient'

/**
 * Deletes a property by ID
 * 
 * @param propertyId Property ID to delete
 * @returns Promise with deletion result
 */
export async function deleteProperty(propertyId: number | string) {
  try {
    return await apiDelete(`property/properties/${propertyId}/`)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 