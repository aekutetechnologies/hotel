import { apiClient } from './apiClient'
import { type ExpenseDocument } from '@/types/expense'

interface UploadResponse {
  success: boolean
  data?: {
    id: number
    document: string
  }
}

/**
 * Uploads a document for a specific expense
 * 
 * @param formData FormData containing the document file and expense ID
 * @returns Promise with upload status and document data
 */
export async function uploadExpenseDoc(formData: FormData): Promise<UploadResponse> {
  try {
    const expenseId = formData.get('expense_id')?.toString() || ''
    
    // When using FormData, let the browser set the Content-Type header automatically
    const data = await apiClient<ExpenseDocument>(
      `expenses/expense/${expenseId}/documents/`,
      {
        method: 'POST',
        body: formData,
        headers: {} // Empty headers so Content-Type is not set to application/json
      }
    )
    
    return { 
      success: true, 
      data: {
        id: data.id,
        document: data.document
      } 
    }
  } catch (error) {
    // Error handling is already done in apiClient
    return { success: false }
  }
} 