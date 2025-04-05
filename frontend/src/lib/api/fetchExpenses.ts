import { apiGet } from './apiClient'
import { type Expense } from '@/types/expense'

/**
 * Fetches all expenses
 * 
 * @returns Promise with expenses data
 */
export async function fetchExpenses(): Promise<Expense[]> {
  try {
    return await apiGet<Expense[]>('expenses/expense/')
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 