import { API_URL } from '../config'

export async function fetchProperties() {
  const response = await fetch(`${API_URL}property/properties/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch properties')
  }

  const data = await response.json()
  return data
} 
