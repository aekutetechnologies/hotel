import { API_URL } from '@/lib/config'
import { User } from '@/types/user'

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}users/users/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }

  const data = await response.json()
  return data as User[]
} 
