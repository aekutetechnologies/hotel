import { apiPost } from './apiClient'

/**
 * Assigns multiple properties to a user
 * 
 * @param userId - The ID of the user to assign properties to
 * @param propertyIds - Array of property IDs to assign to the user
 * @returns Promise with the result of the operation
 */
export async function addPropertiesToUser(userId: number, propertyIds: number[]): Promise<any> {
  return apiPost<any>(`property/add-properties-to-user/?user_id=${userId}`, {
    property_ids: propertyIds
  })
} 