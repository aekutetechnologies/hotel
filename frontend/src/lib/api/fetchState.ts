import { apiClient } from './apiClient';

export async function fetchState() {
  try {
    console.log(`Fetching states`);
    
    // Use apiClient which automatically handles token refresh
    // includeAuth will be true by default, so if token exists it will be included and refreshed if expired
    const data = await apiClient<any[]>('property/state/', {
      includeAuth: !!localStorage.getItem('accessToken'), // Only include auth if token exists
      throwOnError: false // Don't throw, return empty array on error
    });

    if (Array.isArray(data) && data.length > 0) {
      console.log(`Successfully fetched ${data.length} states`);
      return data;
    } else {
      console.warn("Received empty or invalid states list from API");
      return [];
    }
  } catch (error) {
    console.error("Error in fetchState:", error);
    // Return empty array as fallback instead of throwing to prevent component crashes
    console.warn("Returning empty state list as fallback due to error");
    return [];
  }
}
