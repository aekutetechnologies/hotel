import { apiPost } from './apiClient'
import { GroupRole, GroupRoleFormData } from '@/types/groupRole'

/**
 * Creates a new group role
 * 
 * @param groupRoleData Group role data to create
 * @returns Promise with success status and created group role data
 */
export async function createGroupRole(groupRoleData: GroupRoleFormData): Promise<{success: boolean, data?: GroupRole}> {
  try {
    const data = await apiPost<GroupRole>('users/permissions/group/', groupRoleData)
    return { success: true, data }
  } catch (error) {
    // Error handling is already done in apiClient
    return { success: false }
  }
} 