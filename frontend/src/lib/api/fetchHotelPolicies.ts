import { apiGet } from './apiClient'

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