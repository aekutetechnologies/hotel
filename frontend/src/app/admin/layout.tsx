'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, CalendarCheck, CircleDollarSign, Users, Tag, Menu, X, LogOut, UserRound } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Permission, hasPermission } from '@/lib/permissions'

interface NavItem {
  name: string
  href: string
  icon: any
  permissions: Permission[]
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Wait for component to mount to access localStorage
  useEffect(() => {
    setMounted(true)
  }, [])

  const navigation: NavItem[] = [
    { name: 'Properties', href: '/admin/dashboard', icon: Building2, permissions: ['admin:dashboard:view', 'property:view'] },
    { name: 'Bookings', href: '/admin/bookings', icon: CalendarCheck, permissions: ['booking:view'] },
    { name: 'Expenses', href: '/admin/expenses', icon: CircleDollarSign, permissions: ['admin:expense:view'] },
    { name: 'Users', href: '/admin/users', icon: Users, permissions: ['admin:user:view'] },
    { name: 'User Roles', href: '/admin/userroles', icon: UserRound, permissions: ['admin:user:assign-permissions'] },
    { name: 'Offers', href: '/admin/offers', icon: Tag, permissions: ['admin:offer:view'] },
  ]

  // Handle logout
  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear()
    
    // Redirect to public home page
    window.location.href = "/"
  }

  // Show login page directly without layout
  if (pathname === '/admin/login') {
    return children
  }

  // Check if user has permission to see a navigation item
  const canAccessNavItem = (item: NavItem): boolean => {
    if (!mounted) return false
    return item.permissions.some(permission => hasPermission(permission))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          className="fixed top-4 left-4 z-40"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-center border-b">
          <Link href="/admin/dashboard" className="text-2xl font-bold text-[#B11E43]">
            hsquare admin
          </Link>
        </div>
        <nav className="mt-8">
          <div className="px-2 space-y-1">
            {mounted && navigation.filter(canAccessNavItem).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-[#B11E43] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleLogout}>
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </main>
      </div>
    </div>
  )
}

