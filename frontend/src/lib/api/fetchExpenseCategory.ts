import { apiGet } from './apiClient'
import { type ExpenseCategory } from '@/types/expense'

/**
 * Fetches expense categories
 * 
 * @returns Promise with expense categories
 */
export async function fetchExpenseCategory(): Promise<ExpenseCategory[]> {
  try {
    return await apiGet<ExpenseCategory[]>('expenses/expense-category/')
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 