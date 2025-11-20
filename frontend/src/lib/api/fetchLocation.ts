import { apiClient } from './apiClient';

export async function fetchLocation(location: string) {
  try {
    console.log(`Fetching location data for "${location}"`);
    
    // Use apiClient which automatically handles token refresh
    // includeAuth will be true by default, so if token exists it will be included and refreshed if expired
    const data = await apiClient<any[]>(`property/search/${location}/`, {
      includeAuth: !!localStorage.getItem('accessToken'), // Only include auth if token exists
      throwOnError: false // Don't throw, return empty array on error
    });

    if (Array.isArray(data) && data.length > 0) {
      console.log(`Successfully fetched location data with ${data.length} results`);
      return data;
    } else {
      console.warn("Received empty or invalid location results from API");
      return [];
    }
  } catch (error) {
    console.error("Error in fetchLocation:", error);
    // Return empty array as fallback instead of throwing
    console.warn("Returning empty location results due to error");
    return [];
  }
}
