'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchResults } from '@/components/SearchResults'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { LoginDialog } from '@/components/LoginDialog'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [isNavModalOpen, setIsNavModalOpen] = useState(false)
  const [sectionType, setSectionType] = useState<"hotels" | "hostels">("hotels")

  // Helper to convert the section type from "hotels"/"hostels" to "hotel"/"hostel"
  const getSingularType = (type: "hotels" | "hostels"): "hotel" | "hostel" => {
    return type === "hotels" ? "hotel" : "hostel";
  };

  // Login handlers - MUST be before any conditional logic
  useEffect(() => {
    const storedName = localStorage.getItem("name")
    const storedAccessToken = localStorage.getItem("accessToken")
    
    if (storedName && storedAccessToken) {
      setIsLoggedIn(true)
      setUserName(storedName)
    }
  }, [])

  // Sync navbar section type with search params (hostels vs hotels)
  useEffect(() => {
    try {
      const pt = (searchParams?.get('propertyType') || '').toLowerCase()
      setSectionType(pt === 'hostel' ? 'hostels' : 'hotels')
    } catch {
      // fallback to default 'hotels'
      setSectionType('hotels')
    }
  }, [searchParams])

  const handleLoginClick = () => {
    setIsLoginDialogOpen(true)
  }

  const handleLoginSuccess = (name: string) => {
    setIsLoggedIn(true)
    setUserName(name)
    setIsLoginDialogOpen(false)
  }

  const handleLogout = () => {
    localStorage.clear()
    setIsLoggedIn(false)
    setUserName("")
    window.location.href = "/"
  }

  const setShowDetailSection = (section: string) => {
    window.location.href = `/home?type=${section}`
  }

  // Handle navModal state change from Navbar
  const handleNavModalChange = (isOpen: boolean) => {
    setIsNavModalOpen(isOpen);
  };

  return (
    <div className="overflow-visible">
      <Navbar
        isLoggedIn={isLoggedIn}
        userName={userName}
        handleLogout={handleLogout}
        handleLoginClick={handleLoginClick}
        setShowDetailSection={(section: string) => {
          if (section) {
            setShowDetailSection(section);
          }
        }}
        isClosed={isClosed}
        currentSection={getSingularType(sectionType)}
        onNavModalChange={handleNavModalChange}
        isDetailPage={true}
      />
      <motion.main 
        className="min-h-screen bg-gray-50 overflow-visible"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Suspense fallback={
            <div className="flex justify-center items-center h-screen">
              <Spinner className="w-10 h-10" />
            </div>
          }>
            <SearchResults />
          </Suspense>
        </motion.div>
      </motion.main>
      <Footer sectionType="hotels" />

      <LoginDialog 
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}

