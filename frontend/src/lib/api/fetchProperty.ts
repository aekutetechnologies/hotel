import { API_URL } from '../config'

export async function fetchProperty(id: string) {
  const response = await fetch(`${API_URL}property/properties/${id}/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch property with id ${id}`)
  }

  return await response.json()
} 