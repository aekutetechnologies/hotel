'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import { ShieldAlert } from 'lucide-react'

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <ShieldAlert className="h-20 w-20 text-red-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/admin/dashboard">
            Go to Dashboard
          </Link>
        </Button>
        <Button variant="neutral" asChild>
          <Link href="/home?section=hotels">
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
} 