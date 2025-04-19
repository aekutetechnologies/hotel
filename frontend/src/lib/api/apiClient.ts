import { API_URL } from '../config'
import { isAuthError, handleInvalidToken } from '../errorHandling'
import { toast } from 'react-toastify'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  includeAuth?: boolean
  throwOnError?: boolean
  isFormData?: boolean
}

/**
 * Standardized API client that handles authentication and errors consistently
 * 
 * @param endpoint API endpoint to call (will be appended to API_URL)
 * @param options Request options
 * @returns Promise with the response data
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    includeAuth = true,
    throwOnError = true,
    isFormData = false
  } = options

  // Build request URL
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_URL}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    ...headers
  }

  // Only add Content-Type for JSON requests
  if (!isFormData) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  // Add auth token if needed
  if (includeAuth) {
    const token = localStorage.getItem('accessToken')
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders
  }

  // Add request body if needed
  if (body && method !== 'GET') {
    // Don't stringify FormData objects
    requestOptions.body = isFormData ? body : JSON.stringify(body)
  }

  try {
    // Execute fetch request
    const response = await fetch(url, requestOptions)

    // Handle successful response
    if (response.ok) {
      // Check for JSON response
      if (response.headers.get('content-type')?.includes('application/json')) {
        return await response.json()
      }
      // Return empty object for non-JSON responses
      return {} as T
    }

    // Handle error response
    let errorData: any = {}
    let errorText = ''
    
    // First try to get the response as JSON
    const responseClone = response.clone()
    try {
      errorData = await response.json()
    } catch (e) {
      // If parsing as JSON fails, try to get as text
      try {
        errorText = await responseClone.text()
        errorData = { message: errorText }
      } catch (textError) {
        // If all else fails, use a generic error message
        errorData = { message: `Failed to parse error response. Status: ${response.status}` }
      }
    }

    // Check for auth errors
    if (isAuthError(response.status, errorData)) {
      // Handle invalid token
      handleInvalidToken()
      toast.error('Session expired. Please login again.')
      throw new Error('Authentication error: ' + (errorData.message || 'Invalid token'))
    }

    // Handle other errors
    const errorMessage = errorData.message || 
                         errorData.detail || 
                         errorData.error || 
                         `Request failed with status ${response.status}`
    
    if (throwOnError) {
      // Format error message for toast - limit length and truncate if too long
      const maxToastLength = 150
      const toastMessage = typeof errorMessage === 'string' && errorMessage.length > maxToastLength
        ? `${errorMessage.substring(0, maxToastLength)}...`
        : errorMessage
      
      toast.error(toastMessage)
      throw new Error(errorMessage)
    }
    
    return { error: errorMessage } as unknown as T
  } catch (error: any) {
    // Handle fetch errors
    if (!error.message?.includes('Authentication error')) {
      // Format error message for toast - limit length
      const maxToastLength = 150
      const toastMessage = error.message && typeof error.message === 'string' && error.message.length > maxToastLength
        ? `${error.message.substring(0, maxToastLength)}...`
        : (error.message || 'An unexpected error occurred')
      
      toast.error(toastMessage)
    }
    
    throw error
  }
}

// Convenience methods
export const apiGet = <T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) => 
  apiClient<T>(endpoint, { ...options, method: 'GET' })

export const apiPost = <T>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method'>) => 
  apiClient<T>(endpoint, { ...options, method: 'POST', body })

export const apiPut = <T>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method'>) => 
  apiClient<T>(endpoint, { ...options, method: 'PUT', body })

export const apiPatch = <T>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method'>) => 
  apiClient<T>(endpoint, { ...options, method: 'PATCH', body })

export const apiDelete = <T>(endpoint: string, options?: Omit<ApiOptions, 'method'>) => 
  apiClient<T>(endpoint, { ...options, method: 'DELETE' }) 