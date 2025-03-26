'use client'

import { ReactNode, useEffect } from 'react'
import { Permission } from '@/lib/permissions'
import { usePermissions } from '@/hooks/usePermissions'

interface PermissionGuardProps {
  children: ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: ReactNode
}

export function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null
}: PermissionGuardProps) {
  const { can, canAll, canAny, isLoaded, userPermissions } = usePermissions()
  
  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('PermissionGuard rendering:', {
        permission,
        permissions,
        requireAll,
        isLoaded,
        userPermissions,
        hasPermission: permission ? can(permission) : null,
        hasAllPermissions: permissions.length ? canAll(permissions) : null,
        hasAnyPermissions: permissions.length ? canAny(permissions) : null
      })
    }
  }, [permission, permissions, requireAll, isLoaded, can, canAll, canAny, userPermissions])
  
  // Wait for permissions to load
  if (!isLoaded) {
    console.debug('PermissionGuard: Permissions not loaded yet')
    return null
  }
  
  // Check single permission
  if (permission) {
    const hasPermission = can(permission)
    console.debug(`PermissionGuard: Checking permission "${permission}" => ${hasPermission}`)
    return hasPermission ? <>{children}</> : <>{fallback}</>
  }
  
  // Check multiple permissions
  if (permissions.length > 0) {
    if (requireAll) {
      const hasAllRequired = canAll(permissions)
      console.debug(`PermissionGuard: Checking ALL permissions [${permissions.join(', ')}] => ${hasAllRequired}`)
      return hasAllRequired ? <>{children}</> : <>{fallback}</>
    } else {
      const hasAnyRequired = canAny(permissions)
      console.debug(`PermissionGuard: Checking ANY permissions [${permissions.join(', ')}] => ${hasAnyRequired}`)
      return hasAnyRequired ? <>{children}</> : <>{fallback}</>
    }
  }
  
  // No permissions specified, render children
  console.debug('PermissionGuard: No permission check required')
  return <>{children}</>
} 