import { API_URL } from '../config'

/**
 * Fetches properties from the API with optional query parameters.
 *
 * @param {URLSearchParams} params - Optional URLSearchParams to filter properties.
 * @returns {Promise<any>} - A promise that resolves to the fetched properties data.
 * @throws {Error} - Throws an error if the fetch request fails.
 */
export async function fetchProperties(params?: URLSearchParams, property_type?: string) {
  console.log("Fetching properties with params:", params)

  
  // Safely get token
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (!token) {
    console.error('No access token found in localStorage');
    throw new Error('Authentication required - Please log in');
  }

  try {
    // Convert URLSearchParams to a query string, if params are provided
    const queryParams = params ? params.toString() : '';
    const propertyTypeParam = property_type ? `property_type=${property_type}` : '';
    const id = localStorage.getItem('userId');
    console.log("User ID:", id);
    const idParam = id ? `id=${id}` : '';
    const queryString = [queryParams, propertyTypeParam, idParam].filter(Boolean).join('&');
    const url = `${API_URL}property/properties/${queryString ? `?${queryString}` : ''}`;
    
    console.log("Fetching properties from URL:", url);

    // Fetch properties from the API endpoint with authorization header
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Handle non-successful responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Failed to fetch properties:', errorData);
      throw new Error(errorData?.message || `Failed to fetch properties: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response and return the data
    const data = await response.json();
    console.log(`Fetched ${data.length || 0} properties successfully`);
    return data;
  } catch (error) {
    console.error('Error in fetchProperties:', error);
    throw error;
  }
}
