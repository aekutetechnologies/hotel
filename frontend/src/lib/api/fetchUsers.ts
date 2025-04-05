import { apiGet } from './apiClient'
import { User } from '@/types/user'

/**
 * Fetches all users
 * 
 * @returns Promise with array of users
 */
export async function fetchUsers(): Promise<User[]> {
  try {
    return await apiGet<User[]>('users/users/')
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 
