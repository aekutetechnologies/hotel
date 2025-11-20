import { API_URL } from '../config'
import { apiGet } from './apiClient'

export interface ReviewAuthor {
  name?: string
  mobile?: string
}

export interface ReviewResponse {
  id: number
  review: string
  rating: number
  created_at: string
  user?: ReviewAuthor
  property?: {
    id: number
    name: string
    property_type: string
  }
}

export async function fetchTopReviews(propertyType: 'hotel' | 'hostel', limit = 10) {
  const params = new URLSearchParams({
    property_type: propertyType,
    limit: limit.toString(),
  })

  try {
    const data = await apiGet<ReviewResponse[]>(`property/reviews/top/?${params.toString()}`)
    return data || []
  } catch (error) {
    console.error('Failed to fetch top reviews', error)
    throw error
  }
}

