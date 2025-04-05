import { apiGet } from './apiClient'

/**
 * Fetches areas by city id
 * 
 * @param cityId City ID to filter areas by
 * @returns Promise with array of areas
 */
export async function fetchCityArea(cityId: string) {
  try {
    return await apiGet(`property/areas/${cityId}/`)
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
}
