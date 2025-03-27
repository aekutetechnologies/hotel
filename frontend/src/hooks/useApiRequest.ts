import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook to safely handle API requests with loading state and preventing duplicate submissions
 * 
 * @param apiFunction The async function that makes the API call
 * @param onSuccess Optional callback function to execute on successful API call
 * @param onError Optional callback function to execute when API call fails
 * @returns Object containing loading state, error state, and safe handler function
 */
export function useApiRequest<T, P extends any[]>(
  apiFunction: (...args: P) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: Error) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isRequestPendingRef = useRef(false);

  const execute = useCallback(
    async (...args: P) => {
      // Prevent duplicate submissions
      if (isRequestPendingRef.current) {
        console.log('Request already in progress, ignoring duplicate submission');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        isRequestPendingRef.current = true;
        
        const result = await apiFunction(...args);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        if (onError) {
          onError(error);
        }
        
        console.error('API request failed:', error);
        throw error;
      } finally {
        setIsLoading(false);
        isRequestPendingRef.current = false;
      }
    },
    [apiFunction, onSuccess, onError]
  );

  return {
    isLoading,
    error,
    execute
  };
}

/**
 * Higher-order function to create a debounced version of a function
 * 
 * @param func The function to debounce
 * @param wait The wait time in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
} 