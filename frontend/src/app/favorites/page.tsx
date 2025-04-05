"use client"

import { FavoriteProperties } from "@/components/favorite-properties"
import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function FavoritesPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")

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

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear()
    
    // Update state
    setIsLoggedIn(false)
    
    // Redirect to home page
    router.push("/")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <div className="w-full relative">
        <div className="flex justify-between items-center px-4 md:px-6 py-3 bg-white shadow-sm max-w-[100vw] overflow-x-hidden">
          <div className="flex-1">
            <Navbar
              isLoggedIn={isLoggedIn}
              userName={userName}
              handleLogout={handleLogout}
              handleLoginClick={() => {}}
              setShowDetailSection={() => {}}
              isClosed={false}
              currentSection="hotel"
            />
          </div>
        </div>
      </div>
      
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
    </div>
  )
} 