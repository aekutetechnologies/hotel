"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  User,
  LogIn,
  Users,
  Wifi,
  Coffee,
  Clock,
  MapPin,
  Calendar,
  Bed,
  Minus,
  Plus,
  Search,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Hero } from "../components/Hero"

const hotelImages = [
  "/images/hotels/hotel_1.webp",
  "/images/hotels/hotel_3.webp",
  "/images/hotels/hotel_2.webp",
]

const hostelImages = [
  "/images/hostels/hostel_1.jpg",
  "/images/hostels/hostel_2.jpg",
  "/images/hostels/hostel_3.jpg",
]

// Update the Logo component to include responsive sizing
const Logo = () => (
  <div className="logo-container">
    <div className="logo md:w-10 md:h-10 w-6 h-6">
      <div className="diagonal"></div>
    </div>
    <div className="text">
      <div className="brand-name md:text-lg text-sm">Hsquare</div>
      <div className="tagline md:text-xs text-[8px]">harmony in living</div>
    </div>
  </div>
)

const useImagePreloader = (imageSources: string[]) => {
  const [imagesPreloaded, setImagesPreloaded] = useState(false)

  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imagePromises = imageSources.map((src) => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(src)
            img.onerror = () => reject(`Failed to load image: ${src}`)
            img.src = src
          })
        })

        await Promise.all(imagePromises)
        setImagesPreloaded(true)
      } catch (error) {
        console.error("Error preloading images:", error)
        // Set imagesPreloaded to true even if there's an error, to allow the component to render
        setImagesPreloaded(true)
      }
    }

    preloadImages()
  }, [imageSources])

  return imagesPreloaded
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLoginClick = () => {
    setIsLoggedIn(!isLoggedIn)
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Navbar for web view */}
      <div className="hidden md:block absolute top-0 left-0 right-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <button
            onClick={handleLoginClick}
            className="px-4 py-2 rounded-full bg-[#A31C44] hover:bg-[#8A1839] transition-colors text-white"
          >
            {isLoggedIn ? (
              <>
                <User className="w-5 h-5 mr-2 inline" />
                <span>Profile</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2 inline" />
                <span>Login</span>
              </>
            )}
          </button>
        </nav>
      </div>

      <Hero onLoginClick={handleLoginClick} isLoggedIn={isLoggedIn} />
    </div>
  )
}

