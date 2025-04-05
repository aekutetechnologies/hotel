import { apiGet } from './apiClient'
import { PermissionData } from '@/types/permission'

/**
 * Fetches available permissions
 * 
 * @returns Promise with permissions data
 */
export async function fetchPermissions(): Promise<PermissionData[]> {
  try {
    return await apiGet<PermissionData[]>('users/permissions/')
  } catch (error) {
    // Error handling is already done in apiClient
    return []
  }
} 