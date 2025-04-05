import { apiDelete } from './apiClient'

/**
 * Deletes a group role
 * 
 * @param id Group role ID to delete
 * @returns Promise with deletion result
 */
export async function deleteGroupRole(id: string | number) {
  try {
    return await apiDelete(`users/permissions/group/${id}/`)
  } catch (error) {
    // Error handling is already done in apiClient
    throw error
  }
}