import { apiDelete, apiGet, apiPost, apiPut } from './apiClient'

interface Rule {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

/**
 * Fetches hotel policies/rules
 * 
 * @returns Promise with hotel policies data
 */
export async function fetchHotelPolicies(): Promise<Rule[]> {
  try {
    return await apiGet<Rule[]>('property/rules/')
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 

export async function createHotelPolicy(name: string): Promise<Rule> {
  return apiPost<Rule>('property/rules/', { name })
}

export async function updateHotelPolicy(id: number, name: string): Promise<Rule> {
  return apiPut<Rule>(`property/rules/${id}/`, { name })
}

export async function deleteHotelPolicy(id: number): Promise<void> {
  await apiDelete(`property/rules/${id}/`)
}