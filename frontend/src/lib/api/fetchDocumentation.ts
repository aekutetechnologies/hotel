import { apiGet } from './apiClient'

interface Documentation {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

/**
 * Fetches documentation types
 * 
 * @returns Promise with documentation data
 */
export async function fetchDocumentation(): Promise<Documentation[]> {
  try {
    return await apiGet<Documentation[]>('property/documentations/')
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 