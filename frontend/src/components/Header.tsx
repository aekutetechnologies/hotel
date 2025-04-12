"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { NewButton } from "@/components/ui/new-button"
import { Menu, X, LogIn, MessageCircle } from 'lucide-react'
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const whatsappLink = "https://api.whatsapp.com/send?phone=9090151524&text=I%20checked%20the%20website,%20and%20I%20have%20a%20few%20questions%20to%20ask"

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

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  // If mobile menu is open, prevent scrolling on the body
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isMobileMenuOpen])

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
          <Link href="/home?type=hotels" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Hsquare Logo" 
              width={150} 
              height={50} 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-base text-gray-600 hover:text-gray-900">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span>9090151524</span>
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
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </NewButton>
              )}
            </div>
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button 
              className="p-2 text-gray-600 focus:outline-none" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-white z-50 pt-16">
            <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between px-4">
              <h2 className="text-xl font-semibold">Menu</h2>
              <button 
                className="p-2 rounded-lg bg-gray-100 text-gray-800 focus:outline-none hover:bg-gray-200 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <span className="text-sm font-medium">Close</span>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="container mx-auto px-4 flex flex-col items-center gap-6">
              <Link 
                href={whatsappLink} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-base py-3 border-b border-gray-100 w-full justify-center text-gray-600 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageCircle className="h-5 w-5 text-green-600" />
                <span>+91 9090151524</span>
              </Link>

              <div className="w-full flex justify-center py-3">
                {isLoggedIn ? (
                  <div className="flex flex-col items-center gap-4">
                    <p className="font-semibold text-lg">Hi, {userName}</p>
                    <Button 
                      variant="default"
                      className="w-full bg-[#B11E43] hover:bg-[#8f1836]"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <NewButton 
                    variant="default" 
                    size="lg"
                    className="w-full"
                    onClick={() => { 
                      setIsLoginOpen(true); 
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Login
                  </NewButton>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <LoginDialog 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}

