// Default API URL - will be used if no other value is provided
// const DEFAULT_API_URL = 'http://localhost:8000/api/';
const DEFAULT_API_URL = 'http://147.93.97.63/api/api/';

// Get API URL from environment variables if available
function getApiUrl(): string {
  try {
    // Check for Next.js environment variables
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.NEXT_PUBLIC_API_URL) {
        console.log(`Using API URL from NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
        return process.env.NEXT_PUBLIC_API_URL.endsWith('/') 
          ? process.env.NEXT_PUBLIC_API_URL 
          : `${process.env.NEXT_PUBLIC_API_URL}/`;
      }
    }
    
    // Check for window object (client-side only)
    if (typeof window !== 'undefined') {
      // Check if we have a window.__config__ object with API_URL
      const windowConfig = (window as any).__config__;
      if (windowConfig && windowConfig.API_URL) {
        console.log(`Using API URL from window.__config__: ${windowConfig.API_URL}`);
        return windowConfig.API_URL.endsWith('/') 
          ? windowConfig.API_URL 
          : `${windowConfig.API_URL}/`;
      }
      
      // Optional: Get from localStorage if needed for development
      const localStorageApiUrl = localStorage.getItem('debug_api_url');
      if (localStorageApiUrl) {
        console.log(`Using API URL from localStorage: ${localStorageApiUrl}`);
        return localStorageApiUrl.endsWith('/') 
          ? localStorageApiUrl 
          : `${localStorageApiUrl}/`;
      }
    }
    
    // Fallback to default
    console.log(`Using default API URL: ${DEFAULT_API_URL}`);
    return DEFAULT_API_URL;
  } catch (error) {
    console.warn('Error determining API URL, using default', error);
    return DEFAULT_API_URL;
  }
}

// Export the API URL
export const API_URL = getApiUrl();

// Helper function to construct full API endpoints
export function getApiEndpoint(path: string): string {
  // Remove leading slash from path if it exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_URL}${cleanPath}`;
}

// Export other configuration constants
export const DEFAULT_TIMEOUT = 30000; // 30 seconds