import { apiPut } from './apiClient'

interface UpdateUserRoleParams {
  userId: number | string;
  groupId: number | string;
}

/**
 * Updates a user's role/group
 * 
 * @param params User and role data
 * @returns Promise with update result
 */
export async function updateUserRole(params: UpdateUserRoleParams) {
  const { userId, groupId } = params
  
  try {
    return await apiPut(`users/${userId}/group/`, { group: groupId })
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 