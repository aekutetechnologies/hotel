import { apiDelete, apiGet, apiPost, apiPut } from './apiClient'

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

export async function createDocumentation(name: string): Promise<Documentation> {
  return apiPost<Documentation>('property/documentations/', { name })
}

export async function updateDocumentation(id: number, name: string): Promise<Documentation> {
  return apiPut<Documentation>(`property/documentations/${id}/`, { name })
}

export async function deleteDocumentation(id: number): Promise<void> {
  await apiDelete(`property/documentations/${id}/`)
}