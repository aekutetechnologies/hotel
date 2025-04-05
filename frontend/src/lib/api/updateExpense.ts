import { apiPut } from './apiClient'
import { type Expense, type ExpenseFormData } from '@/types/expense'

/**
 * Updates an expense
 * 
 * @param id ID of the expense to update
 * @param updateData Expense data to update
 * @returns Promise with success status and updated expense data
 */
export async function updateExpense(
  id: string | number, 
  updateData: ExpenseFormData
): Promise<{success: boolean, data?: Expense}> {
  try {
    const response = await apiPut<Expense>(`expenses/expense/${id}/`, updateData)
    return { success: true, data: response }
  } catch (error) {
    // Error handling is already done in apiClient
    return { success: false }
  }
} 