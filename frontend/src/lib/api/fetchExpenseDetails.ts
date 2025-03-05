import { API_URL } from '../config'

export async function fetchExpenseDetails(id: string) {
  const response = await fetch(`${API_URL}expenses/expenses/${id}/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch expense details with id ${id}`)
  }

  return await response.json()
} 