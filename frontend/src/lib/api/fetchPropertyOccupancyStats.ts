import { apiGet } from './apiClient'

export interface PropertyOccupancyStat {
  property_id: number
  property_name: string
  property_type: string
  total_rooms: number
  occupied_rooms: number
  occupancy_percentage: number
}

/**
 * Fetches property occupancy statistics from the API
 * @returns Promise with property occupancy stats
 */
export async function fetchPropertyOccupancyStats(): Promise<PropertyOccupancyStat[]> {
  try {
    return await apiGet<PropertyOccupancyStat[]>('stats/property-occupancy/')
  } catch (error) {
    throw error
  }
} 