'use client'

import { useState, useEffect, ReactNode } from 'react'
import { Permission, getUserPermissions } from '@/lib/permissions'

export function usePermissions() {
  const [mounted, setMounted] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [userPermissions, setUserPermissions] = useState<Permission[]>([])
  
  useEffect(() => {
    // This will run on the client only
    setMounted(true)
    
    try {
      // Get user permissions from localStorage
      const permissions = getUserPermissions()
      console.debug('usePermissions - loaded permissions:', permissions)
      setUserPermissions(permissions)
    } catch (error) {
      console.error('Error loading permissions:', error)
    } finally {
      setInitialized(true)
    }
  }, [])
  
  // Check if user has a specific permission
  const can = (permission: Permission): boolean => {
    if (!mounted) {
      console.debug(`usePermissions - not mounted yet - can('${permission}') => false`)
      return false
    }
    
    const result = userPermissions.includes(permission)
    console.debug(`usePermissions - can('${permission}') => ${result}`)
    return result
  }
  
  // Check if user has all of the permissions
  const canAll = (permissions: Permission[]): boolean => {
    if (!mounted) return false
    const result = permissions.every(p => userPermissions.includes(p))
    console.debug(`usePermissions - canAll([${permissions.join(', ')}]) => ${result}`)
    return result
  }
  
  // Check if user has any of the permissions
  const canAny = (permissions: Permission[]): boolean => {
    if (!mounted) return false
    const result = permissions.some(p => userPermissions.includes(p))
    console.debug(`usePermissions - canAny([${permissions.join(', ')}]) => ${result}`)
    return result
  }
  
  // Check if a component should be rendered based on permission
  const renderIf = (permission: Permission, fallback: ReactNode = null) => {
    return (children: ReactNode) => {
      const allowed = can(permission)
      console.debug(`usePermissions - renderIf('${permission}') => ${allowed}`)
      if (allowed) {
        return children
      }
      return fallback
    }
  }
  
  // Check if a component should be rendered based on any permission
  const renderIfAny = (permissions: Permission[], fallback: ReactNode = null) => {
    return (children: ReactNode) => {
      const allowed = canAny(permissions)
      console.debug(`usePermissions - renderIfAny([${permissions.join(', ')}]) => ${allowed}`)
      if (allowed) {
        return children
      }
      return fallback
    }
  }
  
  return {
    can,
    canAll,
    canAny,
    renderIf,
    renderIfAny,
    isLoaded: mounted && initialized,
    userPermissions
  }
} 