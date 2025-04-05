/**
 * Group role data as returned from the API
 */
export interface GroupRole {
  id: number
  name: string
  permissions: string[] | number[] | Array<{id: number, name: string}>
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Form data for creating or updating a group role
 */
export interface GroupRoleFormData {
  name: string
  permissions: Array<string | number>
  is_active: boolean
} 