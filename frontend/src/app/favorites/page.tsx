"use client"

import { FavoriteProperties } from "@/components/favorite-properties"
import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Footer from "@/components/Footer"
import { Header } from "@/components/Header"

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
      <Header />
      
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