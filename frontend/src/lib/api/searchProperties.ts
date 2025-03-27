import { API_URL } from '../../lib/config'
import { Property } from '@/types/property'

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
    const url = new URL(`${API_URL}/property/public/search/`)
    if (params) {
      // Append all parameters to the URL
      params.forEach((value, key) => {
        if (value) url.searchParams.append(key, value)
      })
    }
    
    console.log(`Fetching properties from: ${url.toString()}`)
    
    // Make the API request
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Error fetching properties:', response.status, errorData)
      throw new Error(`Failed to fetch properties: ${response.status}`)
    }
    
    const properties = await response.json()
    console.log(`Successfully fetched ${properties.length} properties`)
    
    return properties
  } catch (error) {
    console.error('Error in searchProperties function:', error)
    // Return an empty array instead of throwing to prevent breaking the UI
    return []
  }
} 