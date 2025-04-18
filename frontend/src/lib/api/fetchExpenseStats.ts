import { apiGet } from './apiClient'

export interface DailyExpense {
  date: string
  total: number
}

export interface MonthlyExpense {
  month: string
  total: number
}

export interface CategoryExpense {
  category: string
  total: number
}

export interface ExpenseStats {
  daily: DailyExpense[]
  monthly: MonthlyExpense[]
  by_category: CategoryExpense[]
}

export interface ExpenseFilters {
  start_date?: string
  end_date?: string
}

/**
 * Fetches expense statistics from the API with optional date filters
 * @param filters Optional date filters
 * @returns Promise with expense statistics
 */
export async function fetchExpenseStats(filters?: ExpenseFilters): Promise<ExpenseStats> {
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
    const endpoint = `stats/expenses/${queryString ? `?${queryString}` : ''}`
    
    return await apiGet<ExpenseStats>(endpoint)
  } catch (error) {
    throw error
  }
} 