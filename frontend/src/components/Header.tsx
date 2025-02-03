'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { SignIn } from "./SignIn"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from 'next/image'

export function Header() {
  const [showSignIn, setShowSignIn] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === 'name') {
        const storedName = localStorage.getItem('name')
        setUserName(storedName || '') // Update userName with the new name from localStorage
      }
    }

    // Initial load from localStorage
    const storedUserId = localStorage.getItem('userId')
    const storedName = localStorage.getItem('name')
    if (storedUserId && storedName) {
      setIsLoggedIn(true)
      setUserName(storedName)
    }

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange)

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserName('')
    localStorage.removeItem('userId')
    localStorage.removeItem('name')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('role')
  }

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl md:text-3xl font-bold text-[#B11E43] flex items-center">
            <Image
              src="/logo.png"
              alt="Hsquare Logo"
              width={200}
              height={200}
              className="mr-2"
            />
          </Link>
          <div className="flex items-center">
            <nav className="hidden md:flex space-x-6 mr-6">
              <Link href="#" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">Hotels</Link>
              <Link href="#" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">Hostels</Link>
              <Link href="#" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">About</Link>
              <Link href="#" className="text-gray-600 hover:text-[#B11E43] transition-colors duration-300">Contact</Link>
            </nav>
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{userName}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link href="/booking">My Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-[#B11E43] text-white hover:bg-[#8f1836] transition-colors duration-300"
                onClick={() => setShowSignIn(true)}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
      {showSignIn && <SignIn onClose={() => setShowSignIn(false)} setIsLoggedIn={setIsLoggedIn} />}
    </header>
  )
}

