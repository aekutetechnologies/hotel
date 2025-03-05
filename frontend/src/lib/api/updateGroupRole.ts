import { API_URL } from '../config'

interface GroupRole {
  id: number;
  name: string;
  description: string;
}

export async function updateGroupRole(groupRole: GroupRole) {
  const response = await fetch(`${API_URL}users/permissions/group/${groupRole.id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(groupRole)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to update group role')
  }

  return await response.json()
} 