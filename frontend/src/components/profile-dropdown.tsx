"use client"

import { LogOut, User, Calendar, ChevronDown } from 'lucide-react'
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

interface ProfileDropdownProps {
  onLogout: () => void
  userName: string
}

export function ProfileDropdown({ onLogout, userName }: ProfileDropdownProps) {
  const firstLetter = userName.charAt(0).toUpperCase()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [triggerWidth, setTriggerWidth] = useState<number>(0)

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          ref={triggerRef}
          variant="neutral" 
          size="sm" 
          className="hover:bg-red-50 pl-2 pr-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white font-medium text-lg">{firstLetter}</span>
            </div>
            <span className="text-gray-700 text-base">Hi {userName}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        alignOffset={-8}
        className="p-2 rounded-b-lg rounded-t-none border-t-0 shadow-lg mt-1" 
        style={{ 
          zIndex: 1000,
          width: `${triggerWidth}px`,
          marginTop: '-2px',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderTop: 'none',
          animation: 'dropdownSlide 150ms ease-out'
        }}
      >
        <style jsx global>{`
          @keyframes dropdownSlide {
            from {
              opacity: 0;
              transform: translateY(-5px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        <Link href="/profile" passHref>
          <DropdownMenuItem className="cursor-pointer text-base rounded-md my-1 hover:bg-gray-50">
            <User className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/booking" passHref>
          <DropdownMenuItem className="cursor-pointer text-base rounded-md my-1 hover:bg-gray-50">
            <Calendar className="mr-2 h-4 w-4" />
            <span>My Bookings</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 rounded-md my-1 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 text-base" 
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

