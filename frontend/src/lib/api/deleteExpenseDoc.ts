import { apiDelete } from './apiClient'

/**
 * Deletes an expense document
 * 
 * @param documentId ID of the document to delete
 * @returns Promise with operation success
 */
export async function deleteExpenseDoc(documentId: string): Promise<void> {
  try {
    await apiDelete(`expenses/expense-document/${documentId}/`)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 