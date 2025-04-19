import { apiGet } from './apiClient'
import { type UserDocument } from '@/types/user'

/**
 * Fetches documents for a specific user
 * 
 * @param userId ID of the user to fetch documents for
 * @returns Promise with array of user documents
 */
export async function listUserDoc(userId: string): Promise<UserDocument[]> {
  try {
    return await apiGet<UserDocument[]>(`users/user-document/${userId}/`)
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 