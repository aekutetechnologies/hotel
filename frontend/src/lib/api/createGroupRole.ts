import type { ActionResponse } from '@/types/actions'
import { GroupRole } from '@/types/groupRole'
import { API_URL } from '../config'

export async function createGroupRole(groupRole: GroupRole): Promise<ActionResponse> {
  const response = await fetch(`${API_URL}users/permissions/group/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(groupRole)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to create group role')
  }

  return await response.json()
} 