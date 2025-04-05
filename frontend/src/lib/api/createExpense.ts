import { apiPost } from './apiClient'
import { type ExpenseFormData, type Expense } from '@/types/expense'

/**
 * Creates a new expense
 * 
 * @param expense Expense data to create
 * @returns Promise with created expense data
 */
export async function createExpense(expense: ExpenseFormData): Promise<{success: boolean, data?: Expense}> {
  try {
    const response = await apiPost<Expense>('expenses/expense/', expense)
    return { success: true, data: response }
  } catch (error) {
    // Error handling is already done in apiClient
    return { success: false }
  }
} 