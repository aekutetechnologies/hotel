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