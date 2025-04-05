import { apiGet } from './apiClient'

/**
 * Fetches expense details by ID
 * 
 * @param id Expense ID to fetch details for
 * @returns Promise with expense details
 */
export async function fetchExpenseDetails(id: string) {
  try {
    return await apiGet(`expenses/expense/${id}/`)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 