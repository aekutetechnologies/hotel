import type { ActionResponse } from '@/types/actions'
import { API_URL } from '../config'

export async function fetchGroupRoles() {
  const response = await fetch(`${API_URL}users/permissions/group/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to fetch group roles')
  }

  return await response.json()
} 