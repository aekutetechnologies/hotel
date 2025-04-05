import { apiPut } from './apiClient'
import { UserProfile } from '@/types/profile'

/**
 * Updates the user's profile
 * 
 * @param profileData Profile data to update
 * @returns Promise with updated profile data
 */
export async function updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
  try {
    return await apiPut<UserProfile>('users/profile/', profileData)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 