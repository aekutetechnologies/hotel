import { apiGet } from './apiClient'
import { type Property } from '@/types/property'

/**
 * Fetches properties assigned to a specific user
 * 
 * @param userId - The ID of the user to fetch properties for
 * @returns Promise with array of user's properties
 */
export async function getUserProperties(userId: number): Promise<Property[]> {
  return apiGet<Property[]>(`property/user-properties/?user_id=${userId}`)
} 