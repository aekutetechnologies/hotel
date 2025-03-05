import { API_URL } from '../config'

export async function deleteGroupRole(groupId: number): Promise<string> {
  const response = await fetch(`${API_URL}users/permissions/group/${groupId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  console.log(response)

  if (response.ok) {
    if (response.status === 204) {
      return "Group role deleted successfully"
    } else {
      return "Failed to delete group role"
    }
  } else {
    throw new Error('Failed to delete group role');
  }
}