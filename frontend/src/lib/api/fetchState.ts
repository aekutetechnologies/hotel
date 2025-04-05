import { API_URL, getApiEndpoint, DEFAULT_TIMEOUT } from '../config';

export async function fetchState() {
  try {
    const endpoint = getApiEndpoint('property/state/');
    console.log(`Fetching states from ${endpoint}`);
    
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
        
        // Return empty array as fallback instead of throwing to prevent component crashes
        console.warn("Returning empty state list as fallback");
        return [];
      }

      const data = await response.json();
      console.log(`Successfully fetched ${data.length || 0} states`);
      return data;
    } catch (fetchError: unknown) {
      if ((fetchError as { name?: string }).name === 'AbortError') {
        console.error("Request timed out after", DEFAULT_TIMEOUT, "ms");
        return [];
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Error in fetchState:", error);
    // Return empty array as fallback instead of throwing to prevent component crashes
    console.warn("Returning empty state list as fallback due to error");
    return [];
  }
}
