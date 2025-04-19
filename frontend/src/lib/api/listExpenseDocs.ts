import { apiGet } from './apiClient'
import { type ExpenseDocument } from '@/types/expense'

/**
 * Fetches documents for a specific expense
 * 
 * @param expenseId ID of the expense to fetch documents for
 * @returns Promise with array of expense documents
 */
export async function listExpenseDoc(expenseId: string): Promise<ExpenseDocument[]> {
  try {
    return await apiGet<ExpenseDocument[]>(`expenses/expense-document/${expenseId}/`)
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 