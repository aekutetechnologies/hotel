import { apiGet } from './apiClient'

/**
 * Fetches cities by state id
 * 
 * @param stateId State ID to filter cities by
 * @returns Promise with array of cities
 */
export async function fetchCity(stateId: string) {
  try {
    return await apiGet(`property/city/?state=${stateId}`)
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
}
