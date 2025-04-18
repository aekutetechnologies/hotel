import { apiGet } from './apiClient'

export interface DashboardStats {
  total_hotels: number
  total_hostels: number
  occupancy_percentage: number
  sales: {
    today: {
      total: number
      confirmed: number
      completed: number
      cancelled: number
      pending: number
    }
    month: {
      total: number
      confirmed: number
      completed: number
      cancelled: number
      pending: number
    }
  }
  expenses: {
    today: number
    month: number
  }
  users: {
    total: number
    new_today: number
    new_month: number
  }
}

/**
 * Fetches dashboard statistics from the API
 * @returns Promise with dashboard statistics
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    return await apiGet<DashboardStats>('stats/dashboard/')
  } catch (error) {
    throw error
  }
} 