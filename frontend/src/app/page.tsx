"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LogIn } from "lucide-react"
import { LoginDialog } from "@/components/LoginDialog"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { NewButton } from "@/components/ui/new-button"
import { HomeHero } from "@/components/HomeHero"
import { LoadingScreen } from "@/components/LoadingScreen"
import { DetailSection } from "@/components/DetailSection"
import { Logo } from "@/components/Logo"

// Define static data
const hotelImages = [
  "/images/hotels/hotel_1.webp",
  "/images/hotels/hotel_3.webp",
  "/images/hotels/hotel_2.png",
]

const hostelImages = [
  "/images/hostels/hostel_1.jpg",
  "/images/hostels/hostel_3.jpg",
  "/images/hostels/hostel_2.jpg",
]

// Testimonial data
const hostelTestimonials = [
  {
    author: {
      name: "Sarah Traveler",
      handle: "Backpacker",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "Great atmosphere and met so many cool people! The staff was super friendly and helpful. Will definitely stay again on my next trip.",
  },
  {
    author: {
      name: "Mike Johnson",
      handle: "Digital Nomad",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "Perfect for remote work with fast WiFi and comfortable common areas. The social events made it easy to connect with other travelers.",
  },
  {
    author: {
      name: "Lena Kim",
      handle: "Solo Traveler",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "As a solo female traveler, I felt very safe and welcomed. The location was perfect for exploring the city and the beds were surprisingly comfortable!",
  },
  {
    author: {
      name: "Carlos Rodriguez",
      handle: "Budget Explorer",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "Incredible value for money! Clean facilities, free breakfast, and the best location. This hostel chain never disappoints.",
  },
  {
    author: {
      name: "Emma Wilson",
      handle: "Gap Year Student",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "The pub crawls and city tours organized by the hostel made my stay unforgettable. Met lifelong friends here!",
  },
]

const hotelTestimonials = [
  {
    author: {
      name: "John Doe",
      handle: "Business Traveler",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "Amazing experience! The hotel exceeded all our expectations. The staff went above and beyond to make our stay perfect. Will definitely come back again.",
  },
  {
    author: {
      name: "Emily Parker",
      handle: "Luxury Seeker",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "The attention to detail was impeccable. From the welcome champagne to the turndown service, everything was perfect. The spa treatments were divine!",
  },
  {
    author: {
      name: "Robert Chen",
      handle: "Executive",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "Perfect for business travel. The meeting facilities were top-notch and the room service was prompt. The bed was the most comfortable I've ever slept in.",
  },
  {
    author: {
      name: "Sophia Martinez",
      handle: "Honeymoon",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "We chose this hotel for our honeymoon and it was magical. The romantic dinner on the terrace and the special touches made it unforgettable.",
  },
  {
    author: {
      name: "James Wilson",
      handle: "Family Vacation",
      avatar: "/placeholder.svg?height=150&width=150",
    },
    text: "Our family had an incredible stay. The kids loved the pool and activities while we enjoyed the relaxing atmosphere. Perfect balance for everyone.",
  },
]

// Image preloader hook
const useImagePreloader = (imageSources: string[]) => {
  const [imagesPreloaded, setImagesPreloaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    const preloadImages = async () => {
      try {
        const totalImages = imageSources.length
        let loadedImages = 0

        const imagePromises = imageSources.map((src) => {
          return new Promise((resolve, reject) => {
            const img = new window.Image()
            img.onload = () => {
              loadedImages++
              setLoadingProgress(Math.round((loadedImages / totalImages) * 100))
              resolve(src)
            }
            img.onerror = () => {
              loadedImages++
              setLoadingProgress(Math.round((loadedImages / totalImages) * 100))
              reject(`Failed to load image: ${src}`)
            }
            img.src = src
          })
        })

        await Promise.all(imagePromises)
        setTimeout(() => setImagesPreloaded(true), 500)
      } catch (error) {
        console.error("Error preloading images:", error)
        setTimeout(() => setImagesPreloaded(true), 500)
      }
    }

    preloadImages()
  }, [imageSources])

  return { imagesPreloaded, loadingProgress }
}

export default function Home() {
  // State
  const [isLoaded, setIsLoaded] = useState(false)
  const [expandedSection, setExpandedSection] = useState<"hotels" | "hostels" | null>(null)
  const [showDetailSection, setShowDetailSection] = useState<"hotels" | "hostels" | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [userName, setUserName] = useState("")

  const { imagesPreloaded, loadingProgress } = useImagePreloader([...hotelImages, ...hostelImages])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Handlers
  const handleDiscover = (section: "hotels" | "hostels") => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setShowDetailSection(section)
  }

  const handleCloseDetail = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowDetailSection(null)
    }
  }

  const handleLoginClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoginDialogOpen(true)
  }

  const handleLoginSuccess = (name: string) => {
    setIsLoggedIn(true)
    setUserName(name)
    setIsLoginDialogOpen(false)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserName("")
    localStorage.removeItem('accessToken')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    localStorage.removeItem('name')
    localStorage.removeItem('permissions')
  }

  if (!imagesPreloaded) {
    return <LoadingScreen progress={loadingProgress} />
  }

  return (
    <>
      <AnimatePresence>{!imagesPreloaded && <LoadingScreen progress={loadingProgress} />}</AnimatePresence>

      {imagesPreloaded && (
        <div className="flex flex-col min-h-screen overflow-hidden">
          {/* Navbar for web view */}
          {!showDetailSection && (
            <div className="hidden md:block fixed top-6 left-0 right-0 z-50">
              <nav
                className="mx-auto px-6 flex justify-between items-center bg-white/50 backdrop-blur-md rounded-full shadow-lg max-w-[95rem] w-[170%]"
                style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="py-3">
                  <Logo />
                </div>
                  {isLoggedIn ? (
                    <ProfileDropdown 
                      userName={userName} 
                      onLogout={handleLogout} 
                    />
                  ) : (
                  <NewButton
                    variant="default"
                    onClick={handleLoginClick}
                    size="sm"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                      <span>Login</span>
                  </NewButton>
                  )}
              </nav>
            </div>
          )}

          {/* Home Hero Section */}
          <HomeHero 
            hotelImages={hotelImages}
            hostelImages={hostelImages}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            handleDiscover={handleDiscover}
          />

          {/* Detail Section */}
          <AnimatePresence>
            {(showDetailSection || window.innerWidth < 768) && (
              <DetailSection 
                sectionType={showDetailSection || "hotels"}
                isLoggedIn={isLoggedIn}
                              userName={userName} 
                onClose={handleCloseDetail}
                hotelTestimonials={hotelTestimonials}
                hostelTestimonials={hostelTestimonials}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}
