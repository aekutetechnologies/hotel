

import { API_URL } from '../config'

export async function uploadExpenseDoc(expenseId: string, expenseDoc: File): Promise<{ id: number, doc_url: string }> {
  const formData = new FormData()
  formData.append('file', expenseDoc)

  const response = await fetch(`${API_URL}expenses/expenses/${expenseId}/documents/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Image upload failed: ${JSON.stringify(error)}`)
  }

  return await response.json() as { id: number, doc_url: string }
} 