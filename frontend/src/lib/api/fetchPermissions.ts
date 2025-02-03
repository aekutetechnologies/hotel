
import { API_URL } from '../config'

export async function fetchPermissions() {
  const response = await fetch(`${API_URL}users/permissions/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to fetch permissions')
  }

  return await response.json()
} 