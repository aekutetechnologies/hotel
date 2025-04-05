/**
 * Utility functions for handling errors in the application
 */

/**
 * Navigates to the error page with an optional custom message
 * 
 * @param message Optional custom error message to display
 * @param router Optional Next.js router instance - if not provided, uses window.location
 */
export function navigateToErrorPage(message?: string, router?: any): void {
  const encodedMessage = message ? encodeURIComponent(message) : ''
  const url = `/error${encodedMessage ? `?message=${encodedMessage}` : ''}`
  
  if (router && typeof router.push === 'function') {
    router.push(url)
  } else if (typeof window !== 'undefined') {
    window.location.href = url
  }
}

/**
 * Handles token invalidation by clearing localStorage and redirecting to home
 * Used when the API returns an invalid token error
 * 
 * @param router Optional Next.js router instance
 */
export function handleInvalidToken(router?: any): void {
  console.error('Token invalid or expired. Logging out...')
  
  // Clear all relevant localStorage items
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    localStorage.removeItem('permissions')
    localStorage.removeItem('name')
  }
  
  // Redirect to home page
  if (router && typeof router.push === 'function') {
    router.push('/')
  } else if (typeof window !== 'undefined') {
    window.location.href = '/'
  }
}

/**
 * Checks if an API error response indicates an auth error
 * 
 * @param status HTTP status code
 * @param errorData Error data from response
 * @returns boolean True if this is an auth error
 */
export function isAuthError(status: number, errorData: any): boolean {
  // Check for common auth error status codes
  if (status === 401 || status === 403) {
    return true
  }
  
  // Check for specific error messages related to token
  if (errorData && typeof errorData === 'object') {
    const errorMessage = errorData.message || 
                         errorData.detail || 
                         errorData.error || 
                         ''
    
    if (typeof errorMessage === 'string') {
      const authErrorKeywords = ['token', 'unauthorized', 'invalid token', 'expired token', 'auth', 'authentication']
      return authErrorKeywords.some(keyword => 
        errorMessage.toLowerCase().includes(keyword.toLowerCase())
      )
    }
  }
  
  return false
}

/**
 * Helper function to catch API errors and handle them
 * 
 * @param promise The API promise to handle
 * @param errorHandler Custom error handler
 * @returns Promise result or throws error
 */
export async function handleApiError<T>(
  promise: Promise<T>,
  errorHandler?: (error: any) => void
): Promise<T> {
  try {
    return await promise
  } catch (error: any) {
    // Log the error
    console.error('API Error:', error)
    
    // Call custom error handler if provided
    if (errorHandler) {
      errorHandler(error)
    }
    
    // Determine error message
    const errorMessage = error.message || 'An error occurred while communicating with the server.'
    
    // If no custom handler, use default behavior
    if (!errorHandler) {
      navigateToErrorPage(errorMessage)
    }
    
    throw error
  }
}

/**
 * Example usage:
 * 
 * // With router:
 * try {
 *   const data = await handleApiError(fetchData())
 * } catch (error) {
 *   // Error has already been handled by handleApiError
 * }
 * 
 * // With custom error handling:
 * const data = await handleApiError(fetchData(), (error) => {
 *   // Custom handling
 *   showToast(error.message)
 * })
 */ 