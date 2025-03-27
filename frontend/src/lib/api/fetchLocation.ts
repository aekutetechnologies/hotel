import { API_URL, getApiEndpoint, DEFAULT_TIMEOUT } from '../config';

export async function fetchLocation(location: string) {
  try {
    const endpoint = getApiEndpoint(`property/search/${location}/`);
    console.log(`Fetching location data for "${location}" from ${endpoint}`);
    
    // Check if access token exists
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.warn("No access token found in localStorage. Proceeding with unauthenticated request.");
    }
    
    // Use AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to get error details as text first in case it's not valid JSON
        let errorText = '';
        try {
          errorText = await response.text();
          console.error(`API Error (${response.status}): ${errorText}`);
        } catch (textError) {
          console.error(`API Error (${response.status}): Could not parse error response`);
        }
        
        throw new Error(`Failed to fetch location: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched location data with ${data.length || 0} results`);
      return data;
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        console.error("Request timed out after", DEFAULT_TIMEOUT, "ms");
        throw new Error(`Location search timed out after ${DEFAULT_TIMEOUT / 1000} seconds`);
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Error in fetchLocation:", error);
    // Return empty array as fallback instead of throwing
    console.warn("Returning empty location results due to error");
    return [];
  }
}
