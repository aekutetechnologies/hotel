import { API_URL } from '../config'

export interface ExpenseDocument {
  id: number
  document: string
}

export async function listExpenseDoc(expenseId: string): Promise<ExpenseDocument[]> {
  const response = await fetch(`${API_URL}expenses/expenses/${expenseId}/documents/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch expense documents')
  }

  const data = await response.json()
  return data as ExpenseDocument[]
} 