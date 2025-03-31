"use client"

import { useState, useEffect } from "react"
import { CookieConsent } from "./CookieConsent"

export function CookieConsentClient() {
  const [theme, setTheme] = useState<"hotel" | "hostel">("hotel")
  
  useEffect(() => {
    // Try to detect current section from localStorage if available
    const currentSection = localStorage.getItem("currentSection") as "hotel" | "hostel" | null
    
    if (currentSection) {
      setTheme(currentSection)
    }
    
    // Listen for section changes
    const handleStorageChange = () => {
      const updatedSection = localStorage.getItem("currentSection") as "hotel" | "hostel" | null
      if (updatedSection) {
        setTheme(updatedSection)
      }
    }
    
    window.addEventListener("storage", handleStorageChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])
  
  return <CookieConsent theme={theme} />
} 