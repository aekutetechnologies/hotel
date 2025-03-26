'use client'

import { ReactNode, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { canAccessPage, hasPermission } from '@/lib/permissions'
import { AccessDenied } from './AccessDenied'
import { Spinner } from './ui/spinner'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    // Skip permission check for login page
    if (pathname === '/admin/login') {
      setIsAuthorized(true)
      return
    }

    // Check if user is logged in
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    // Check if the user has permission to access this page
    const authorized = canAccessPage(pathname)
    setIsAuthorized(authorized)
  }, [pathname, router])

  // Still checking permissions
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    )
  }

  // Not authorized
  if (!isAuthorized) {
    return fallback || <AccessDenied />
  }

  // Authorized
  return <>{children}</>
} 