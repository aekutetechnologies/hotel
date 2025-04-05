import { apiGet } from './apiClient'
import { GroupRole } from '@/types/groupRole'

/**
 * Fetches group roles
 * 
 * @returns Promise with group roles data
 */
export async function fetchGroupRoles(): Promise<GroupRole[]> {
  try {
    return await apiGet<GroupRole[]>('users/permissions/group/')
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 