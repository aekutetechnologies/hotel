'use client'

import { createContext, useState, useEffect, ReactNode, useContext } from 'react'
import { Permission, getUserPermissions } from '@/lib/permissions'

interface PermissionContextType {
  isLoaded: boolean
  userPermissions: Permission[]
  hasPermission: (permission: Permission) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
}

const defaultContext: PermissionContextType = {
  isLoaded: false,
  userPermissions: [],
  hasPermission: () => false,
  hasAllPermissions: () => false,
  hasAnyPermission: () => false
}

const PermissionContext = createContext<PermissionContextType>(defaultContext)

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [userPermissions, setUserPermissions] = useState<Permission[]>([])

  useEffect(() => {
    // Get permissions from localStorage
    const permissions = getUserPermissions()
    setUserPermissions(permissions)
    setIsLoaded(true)
  }, [])

  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission)
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => userPermissions.includes(permission))
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission))
  }

  return (
    <PermissionContext.Provider
      value={{
        isLoaded,
        userPermissions,
        hasPermission,
        hasAllPermissions,
        hasAnyPermission
      }}
    >
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermissionContext() {
  return useContext(PermissionContext)
} 