import { apiGet } from './apiClient'
import { UserProfile } from '@/types/profile'

/**
 * Fetches the current user's profile
 * 
 * @returns Promise with user profile data
 */
export async function getProfile(): Promise<UserProfile> {
  try {
    return await apiGet<UserProfile>('users/profile/')
  } catch (error) {
    throw error
  }
} 