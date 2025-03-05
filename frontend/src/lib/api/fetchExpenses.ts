import { API_URL } from '../config'

export async function fetchExpenses() {
  const response = await fetch(`${API_URL}expenses/expense/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch expenses`)
  }

  return await response.json()
} 