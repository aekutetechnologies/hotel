import { apiDelete } from './apiClient'

/**
 * Deletes a booking document
 * 
 * @param documentId Document ID to delete
 * @returns Promise with deletion result
 */
export async function deleteBookingDoc(documentId: string) {
  try {
    return await apiDelete(`booking/documents/${documentId}/`)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
}