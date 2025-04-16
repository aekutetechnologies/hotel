import { apiPost } from './apiClient'

interface UpdateUserRoleParams {
  user_id: number | string;
  group_id: number | string;
}

/**
 * Updates a user's role/group
 * 
 * @param params User and role data
 * @returns Promise with update result
 */
export async function updateUserRole(params: UpdateUserRoleParams) {
  const { user_id, group_id } = params
  
  try {
    return await apiPost(`users/profile/assign-permissions/`, { user_id: user_id, group_id: group_id })
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
} 