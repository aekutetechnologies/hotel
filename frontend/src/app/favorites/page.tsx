"use client"

import { FavoriteProperties } from "@/components/favorite-properties"
import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { LoginDialog } from '@/components/LoginDialog'

export default function FavoritesPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [isNavModalOpen, setIsNavModalOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    const name = localStorage.getItem("name")
    
    if (!token) {
      router.push("/")
      return
    }
    
    if (name) {
      setUserName(name)
      setIsLoggedIn(true)
    }
  }, [router])

  const handleLoginClick = () => {
    setIsLoginDialogOpen(true)
  }

  const handleLoginSuccess = (name: string) => {
    setIsLoggedIn(true)
    setUserName(name)
    setIsLoginDialogOpen(false)
  }

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear()
    
    // Update state
    setIsLoggedIn(false)
    setUserName("")
    
    // Redirect to home page
    router.push("/")
  }

  const setShowDetailSection = (section: string) => {
    window.location.href = `/home?type=${section}`
  }

  const handleNavModalChange = (isOpen: boolean) => {
    setIsNavModalOpen(isOpen)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar
        isLoggedIn={isLoggedIn}
        userName={userName}
        handleLogout={handleLogout}
        handleLoginClick={handleLoginClick}
        setShowDetailSection={setShowDetailSection}
        isClosed={isClosed}
        currentSection="hotels"
        onNavModalChange={handleNavModalChange}
      />
      
      {/* Main content */}
      <main className="flex-1 bg-gray-50">
        <Suspense fallback={
          <div className="w-full py-8 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B11E43]"></div>
              <p className="mt-4 text-gray-600">Loading your favorite properties...</p>
            </div>
          </div>
        }>
          <FavoriteProperties />
        </Suspense>
      </main>
      
      {/* Footer */}
      <Footer sectionType="hotels" />
      
      <LoginDialog 
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
} 