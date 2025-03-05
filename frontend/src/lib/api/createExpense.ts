import type { ActionResponse } from '@/types/actions'
import { Expense } from '@/types/expense'
import { API_URL } from '../config'

export async function createExpense(expense: Expense): Promise<ActionResponse> {
  const response = await fetch(`${API_URL}expenses/expense/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(expense)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to create expense')
  }

  return await response.json()
} 