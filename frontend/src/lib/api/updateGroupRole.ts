import { apiPut } from './apiClient'
import { GroupRole, GroupRoleFormData } from '@/types/groupRole'

interface UpdateGroupRoleParams extends GroupRoleFormData {
  id: number | string
}

/**
 * Updates a group role
 * 
 * @param id ID of the group role to update
 * @param updateData Group role data to update
 * @returns Promise with success status and updated group role data
 */
export async function updateGroupRole(
  id: number | string, 
  updateData: GroupRoleFormData
): Promise<{success: boolean, data?: GroupRole}> {
  try {
    const data = await apiPut<GroupRole>(`users/permissions/group/${id}/`, updateData)
    return { success: true, data }
  } catch (error) {
    // Error handling is already done in apiClient
    return { success: false }
  }
}

/**
 * Legacy function that accepts a combined object with id and data
 * @deprecated Use the two-parameter version instead
 */
export async function updateGroupRoleOld(params: UpdateGroupRoleParams): Promise<{success: boolean, data?: GroupRole}> {
  const { id, ...updateData } = params
  return updateGroupRole(id, updateData)
} 