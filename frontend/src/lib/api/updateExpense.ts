import { API_URL } from '../config'
import { Expense } from '@/types/expense'


export async function updateExpense(id: string, expense: Expense) {
  const response = await fetch(`${API_URL}expenses/expense/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(expense)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to update expense')
  }

  return await response.json()
} 