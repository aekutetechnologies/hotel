import { apiDelete } from './apiClient'

/**
 * Deletes a user document
 * 
 * @param documentId ID of the document to delete
 * @returns Promise with operation success
 */
export async function deleteUserDoc(documentId: string): Promise<void> {
  try {
    await apiDelete(`users/user-document/${documentId}/`)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 