import { API_URL } from '../../lib/config'
import { Property } from '@/types/property'
import { apiGet } from './apiClient'

/**
 * Fetch properties using public search API (no authentication required)
 * @param params URL search parameters for filtering properties
 * @returns Promise that resolves to array of properties
 */
export async function searchProperties(
  params?: URLSearchParams
): Promise<Property[]> {
  try {
    // Log search parameters for debugging
    if (params) {
      console.log('Search properties with params:', Object.fromEntries(params.entries()))
    }
    
    // Construct the search URL with query parameters
    let endpoint = 'property/public/search/'
    if (params && params.toString()) {
      endpoint += `?${params.toString()}`
    }
    
    console.log(`Fetching properties from: ${API_URL}${endpoint}`)
    
    // Make the API request using apiGet
    if (localStorage.getItem('accessToken')) {
      const properties = await apiGet<Property[]>(endpoint, { includeAuth: true });
      console.log(`Successfully fetched ${properties.length} properties`)
      return properties
    } else {
      const properties = await apiGet<Property[]>(endpoint, { includeAuth: false });
      console.log(`Successfully fetched ${properties.length} properties`)
      return properties
    }
  } catch (error) {
    console.error('Error in searchProperties function:', error)
    // Return an empty array instead of throwing to prevent breaking the UI
    return []
  }
} 