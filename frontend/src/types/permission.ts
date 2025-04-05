import { Permission as PermissionType } from '@/lib/permissions'

/**
 * Re-exporting the Permission type from lib/permissions for use in other files
 */
export type Permission = PermissionType

/**
 * Permission data as returned from the API
 */
export interface PermissionData {
  id: number
  name: string
  codename: string
  content_type: {
    id: number
    app_label: string
    model: string
  }
  created_at?: string
  updated_at?: string
} 