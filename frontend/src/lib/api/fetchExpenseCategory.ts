import { API_URL } from '../config'

export async function fetchExpenseCategory() {
  const response = await fetch(`${API_URL}expenses/expense-category/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch expense category`)
  }

  return await response.json()
} 