"use client"

import { LogOut, User, CalendarDays, ChevronDown, Heart, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PermissionGuard } from './PermissionGuard'
import { createPortal } from "react-dom"

interface ProfileDropdownProps {
  onLogout: () => void
  userName: string
}

export function ProfileDropdown({ onLogout, userName }: ProfileDropdownProps) {
  const firstLetter = userName.charAt(0).toUpperCase()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [triggerWidth, setTriggerWidth] = useState<number>(0)
  const [isOpen, setIsOpen] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const router = useRouter()

  // Calculate trigger width on mount and window resize
  useEffect(() => {
    const updateWidth = () => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth)
      }
    }
    
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Enhanced logout function to clear all localStorage and redirect
  const handleLogout = () => {
    // Call the provided onLogout function for backward compatibility
    onLogout()
    
    // Clear all localStorage items
    localStorage.clear()
    
    // Redirect to home page
    router.push('/home?type=hotels')
  }

  const handleButtonClick = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setButtonRect(rect)
    }
    setIsOpen(!isOpen)
  }

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!triggerRef.current) return;
      
      const isClickOnButton = triggerRef.current.contains(event.target as Node);
      const isClickOnDropdown = dropdownRef.current?.contains(event.target as Node);
      
      if (!isClickOnButton && !isClickOnDropdown) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      <Button 
        ref={triggerRef}
        variant="neutral" 
        size="sm" 
        className="hover:bg-red-50 pl-2 pr-3 border-none focus:ring-0 focus:ring-offset-0"
        onClick={handleButtonClick}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center">
            <span className="text-white font-medium text-lg">{firstLetter}</span>
          </div>
          <span className="text-gray-700 text-base">Hi {userName}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
      </Button>
      {isOpen && buttonRect && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed bg-white shadow-lg rounded-md z-[9999] border border-gray-200"
          style={{ 
            width: `${triggerWidth}px`,
            top: buttonRect.bottom + 8,
            left: Math.max(8, buttonRect.right - triggerWidth),
            right: 'auto',
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2">
            <Link href="/profile" onClick={(e) => { console.log("profile clicked"); e.stopPropagation(); setIsOpen(false); }}>
              <div className="cursor-pointer text-base rounded-md my-1 hover:bg-gray-50 px-2 py-2 flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </div>
            </Link>
            <Link href="/booking" onClick={(e) => { console.log("booking clicked"); e.stopPropagation(); setIsOpen(false); }}>
              <div className="cursor-pointer text-base rounded-md my-1 hover:bg-gray-50 px-2 py-2 flex items-center">
                <CalendarDays className="mr-2 h-4 w-4" />
                <span>My Bookings</span>
              </div>
            </Link>
            <Link href="/favorites" onClick={(e) => { console.log("favorites clicked"); e.stopPropagation(); setIsOpen(false); }}>
              <div className="cursor-pointer text-base rounded-md my-1 hover:bg-gray-50 px-2 py-2 flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                <span>My Favorites</span>
              </div>
            </Link>
            <PermissionGuard permission="admin:dashboard:view">
              <Link href="/admin/dashboard" onClick={(e) => { console.log("admin dashboard clicked"); e.stopPropagation(); setIsOpen(false); }}>
                <div className="cursor-pointer text-base rounded-md my-1 hover:bg-gray-50 px-2 py-2 flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </div>
              </Link>
            </PermissionGuard>
            <div className="border-t my-2"></div>
            <div 
              className="cursor-pointer text-red-600 rounded-md my-1 hover:bg-red-50 px-2 py-2 flex items-center" 
              onClick={(e) => { e.stopPropagation(); handleLogout(); setIsOpen(false); }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

