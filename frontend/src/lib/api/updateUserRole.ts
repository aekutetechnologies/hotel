import { API_URL } from '../config'


export async function updateUserRole(userId: string) {
  const response = await fetch(`${API_URL}users/profile/assign-permissions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify({ userId })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to update user role')
  }

  return await response.json()
} 