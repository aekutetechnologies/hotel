import { API_URL } from '../config'

/**
 * Fetches properties from the API with optional query parameters.
 *
 * @param {URLSearchParams} params - Optional URLSearchParams to filter properties.
 * @returns {Promise<any>} - A promise that resolves to the fetched properties data.
 * @throws {Error} - Throws an error if the fetch request fails.
 */
export async function fetchProperties(params?: URLSearchParams, property_type?: string) {
  console.log("params", params)

  // Convert URLSearchParams to a query string, if params are provided
  const queryParams = params ? params.toString() : '';
  console.log("queryParams", queryParams)

  // Fetch properties from the API endpoint with authorization header
  const response = await fetch(`${API_URL}property/properties/?${queryParams}&property_type=${property_type}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  // Handle non-successful responses
  if (!response.ok) {
    throw new Error('Failed to fetch properties')
  }

  // Parse the JSON response and return the data
  const data = await response.json()
  return data
}
