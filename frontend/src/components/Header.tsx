"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { NewButton } from "@/components/ui/new-button"
import { Globe, Phone } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { LoginDialog } from "./LoginDialog"
import { ProfileDropdown } from "./profile-dropdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")

  const handleLoginSuccess = (name: string) => {
    setUserName(name)
    setIsLoggedIn(true)
    setIsLoginOpen(false)
    // Update cache on login
    localStorage.setItem('name', name)
    localStorage.setItem('isLoggedIn', 'true')
  }

  const handleLogout = () => {
    // Update state
    setIsLoggedIn(false)
    setUserName("")
    
    // Clear all localStorage items
    localStorage.clear()
    
    // Redirect to home page (reload)
    window.location.href = "/"
  }

  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === 'name') {
        const storedName = localStorage.getItem('name')
        setUserName(storedName || '')
      }
      if (event.key === 'isLoggedIn') {
        const loggedInStatus = localStorage.getItem('isLoggedIn')
        setIsLoggedIn(loggedInStatus === 'true')
      }
    }

    // Initial load from localStorage (CACHE LOAD)
    const cachedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const cachedUserName = localStorage.getItem('name') || ""
    setIsLoggedIn(cachedIsLoggedIn)
    setUserName(cachedUserName)


    const storedUserId = localStorage.getItem('userId')
    const storedName = localStorage.getItem('name')
    if (storedUserId && storedName) {
      setIsLoggedIn(true)
      setUserName(storedName)
    } else {
      setIsLoggedIn(false) // Ensure logged out state if no user data
      setUserName("")
    }


    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange)

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <>
      <header className="
        sticky 
        top-0 
        bg-white 
        shadow-md 
        w-full 
        py-4 
        z-10
      ">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Hsquare Logo" 
              width={150} 
              height={50} 
              className="h-12 w-auto"
            />
          </Link>

          <div className="flex items-center gap-8">
            <Link href="#" className="flex items-center gap-2 text-base text-gray-600 hover:text-gray-900">
              <Phone className="h-5 w-5" />
              <span>+91 9090151524</span>
            </Link>

            <div className="relative">
              {isLoggedIn ? (
                <ProfileDropdown 
                  onLogout={handleLogout} 
                  userName={userName}
                />
              ) : (
                <NewButton 
                  variant="default" 
                  size="sm"
                  onClick={() => { console.log("Login/Signup button clicked"); setIsLoginOpen(true); }}
                >
                  Login
                </NewButton>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginDialog 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}

