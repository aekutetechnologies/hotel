"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Cookie } from "lucide-react"

interface CookieConsentProps {
  theme?: "hotel" | "hostel"
}

export function CookieConsent({ theme = "hotel" }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false)

  // Theme colors
  const primaryColor = theme === "hotel" ? "#A31C44" : "#343F52"
  const hoverColor = theme === "hotel" ? "#8a1838" : "#242e3c"
  const primaryColorClass = theme === "hotel" ? "bg-[#A31C44] hover:bg-[#8a1838]" : "bg-[#343F52] hover:bg-[#242e3c]"

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem("cookie-consent")
    
    // If no choice has been made, show the banner
    if (!cookieConsent) {
      // Small delay to show the banner after page load
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    // Set cookie consent to "accepted" in localStorage
    localStorage.setItem("cookie-consent", "accepted")
    setShowBanner(false)
    
    // Here you would typically initialize analytics or other cookie-dependent services
    console.log("Cookies accepted")
  }

  const handleReject = () => {
    // Set cookie consent to "rejected" in localStorage
    localStorage.setItem("cookie-consent", "rejected")
    setShowBanner(false)
    
    // Here you would typically disable non-essential cookies
    console.log("Non-essential cookies rejected")
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-200 px-4 py-5 md:py-4"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-shrink-0 hidden md:flex">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}10` }}
                >
                  <Cookie size={24} style={{ color: primaryColor }} />
                </div>
              </div>
              
              <div className="flex-1 pr-8">
                <h3 className="text-lg font-semibold mb-1 text-gray-800">Cookie Settings</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  We use cookies to enhance your browsing experience, personalize content, and analyze our traffic. 
                  Choose your cookie preferences below.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                <button
                  onClick={handleReject}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors text-sm"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAccept}
                  className={`px-5 py-2.5 text-white rounded-lg font-medium transition-colors text-sm ${primaryColorClass}`}
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleReject} 
            className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close cookie consent banner"
          >
            <X size={20} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 