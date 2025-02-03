import { API_URL } from '../config'

interface Profile {
  name: string;
  mobile: string;
  email: string;
}

export async function updateProfile(profile: Profile) {
  const response = await fetch(`${API_URL}users/profile/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(profile)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to update profile')
  }

  return await response.json()
} 