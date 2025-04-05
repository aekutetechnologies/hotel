import { apiPost } from './apiClient'
import { Property } from '@/types/property'

/**
 * Creates a new property
 * 
 * @param property Property data to create
 * @returns Promise with created property data
 */
export async function createProperty(property: Partial<Property>) {
  try {
    return await apiPost('property/properties/', property)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 