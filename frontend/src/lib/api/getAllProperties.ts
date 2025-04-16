import { apiGet } from './apiClient'
import { type Property } from '@/types/property'

/**
 * Fetches all properties from the backend
 * 
 * @returns Promise with array of all properties
 */
export async function getAllProperties(): Promise<Property[]> {
  return apiGet<Property[]>('property/all-properties/')
} 