import { apiGet } from './apiClient'

export interface SalesItem {
  total: number
  confirmed: number
  completed: number
  cancelled: number
  pending: number
}

export interface DailySales {
  date: string
  total: number
  confirmed: number
  completed: number
  cancelled: number
  pending: number
}

export interface MonthlySales {
  month: string
  total: number
  confirmed: number
  completed: number
  cancelled: number
  pending: number
}

export interface SalesStats {
  daily: DailySales[]
  monthly: MonthlySales[]
}

export interface SalesFilters {
  start_date?: string
  end_date?: string
}

/**
 * Fetches sales statistics from the API with optional date filters
 * @param filters Optional date filters
 * @returns Promise with sales statistics
 */
export async function fetchSalesStats(filters?: SalesFilters): Promise<SalesStats> {
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
    const endpoint = `stats/sales/${queryString ? `?${queryString}` : ''}`
    
    return await apiGet<SalesStats>(endpoint)
  } catch (error) {
    throw error
  }
} 