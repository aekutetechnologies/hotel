import { type Property } from './property'

/**
 * Category for an expense
 */
export interface ExpenseCategory {
  id: number
  name: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
}

/**
 * Document attached to an expense
 */
export interface ExpenseDocument {
  id: number
  document: string
  expense: number
  created_at?: string
  updated_at?: string
}

/**
 * Status options for expenses
 */
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid'

/**
 * Expense data as returned from the API
 */
export interface Expense {
  id: number
  property: {
    id: number
    name: string
  }
  category: {
    id: number
    name: string
  }
  description: string
  amount: number
  date: string
  status: ExpenseStatus
  created_at?: string
  updated_at?: string
  documents?: ExpenseDocument[]
}

/**
 * Form data for creating or updating an expense
 */
export interface ExpenseFormData {
  property: string
  category: string
  description: string
  amount: number
  date: string
  status: string
} 