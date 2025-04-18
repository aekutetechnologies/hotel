import { apiGet } from './apiClient'

export interface RoleCounts {
  [key: string]: number
}

export interface DailyNewUsers {
  date: string
  count: number
}

export interface MonthlyNewUsers {
  month: string
  count: number
}

export interface UserStats {
  total_by_role: RoleCounts
  daily_new_users: DailyNewUsers[]
  monthly_new_users: MonthlyNewUsers[]
}

export interface UserFilters {
  start_date?: string
  end_date?: string
}

/**
 * Fetches user statistics from the API with optional date filters
 * This is an admin-only endpoint
 * @param filters Optional date filters
 * @returns Promise with user statistics
 */
export async function fetchUserStats(filters?: UserFilters): Promise<UserStats> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams()
    if (filters?.start_date) {
      queryParams.append('start_date', filters.start_date)
    }
    if (filters?.end_date) {
      queryParams.append('end_date', filters.end_date)
    }
    
    const queryString = queryParams.toString()
    const endpoint = `stats/users/${queryString ? `?${queryString}` : ''}`
    
    return await apiGet<UserStats>(endpoint)
  } catch (error) {
    throw error
  }
} 