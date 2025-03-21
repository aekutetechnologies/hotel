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
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { FeaturedProperties } from "@/components/FeaturedProperties"
import { TestimonialsSection } from "@/components/testimonials-with-marquee"
import TestimonialSection from "@/components/testimonial-section"
import { PropertyTimeline } from "@/components/property-timeline"
import { LoginDialog } from "@/components/LoginDialog"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { TextRotate } from "@/components/text-rotate"
import { NewButton } from "@/components/ui/new-button"
import { text } from "stream/consumers"
import { Button } from "@/components/ui/button"


import AddNavbar from "@/components/AddNavbar"
import Navbar from "@/components/Navbar"
import PlaceCard from "@/components/PlaceCard"
import Features from "@/components/Features"
import SocialSection from "@/components/SocialSection"

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

// Replace the Logo component with this new version
function Logo() {
  return (
    <div className="logo-container flex items-center opacity-100">
      <Image
        src="/logo.png"
        alt="Hsquare Logo"
        width={140}  // Original width
        height={40}  // Original height
        className="md:w-40 md:h-[calc(40*40/140)] w-24 h-[calc(24*40/140)]" // Maintain aspect ratio
        priority // Add priority since this is above the fold
      />
    </div>
  )
}

function LoadingScreen({ progress }: { progress: number }) {
  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <Image
        src="/logo.png"
        alt="Hsquare Logo"
        width={280}  // Larger size for loading screen
        height={80}  // Maintaining aspect ratio
        className="mb-4"
        priority
      />
      <div className="w-64 h-2 bg-gray-800 rounded-full mt-8 overflow-hidden">
        <motion.div
          className="h-full"
          style={{ backgroundColor: 'rgb(138 24 57 / var(--tw-bg-opacity, 1))' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="text-black mt-4 text-lg" style={{ color: 'rgb(138 24 57 / var(--tw-bg-opacity, 1))' }}>
        {progress < 100 ? "Loading Assets..." : "Welcome to Hsquare"}
      </div>
    </motion.div>
  )
}

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

// Add testimonial data
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

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [expandedSection, setExpandedSection] = useState<"hotels" | "hostels" | null>(null)
  const [currentHotelImage, setCurrentHotelImage] = useState(0)
  const [currentHostelImage, setCurrentHostelImage] = useState(0)
  const [showDetailSection, setShowDetailSection] = useState<"hotels" | "hostels" | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const detailSectionRef = useRef<HTMLDivElement>(null)
  const [isHourlyBooking, setIsHourlyBooking] = useState(false)

  const [location, setLocation] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [checkInTime, setCheckInTime] = useState("")
  const [checkOutTime, setCheckOutTime] = useState("")
  const [rooms, setRooms] = useState(1)
  const [guests, setGuests] = useState("1")
  const [bookingType, setBookingType] = useState<"day" | "hour">("day")
  const [months, setMonths] = useState(1)

  const [nextHotelImage, setNextHotelImage] = useState(0)
  const [nextHostelImage, setNextHostelImage] = useState(0)

  const { imagesPreloaded, loadingProgress } = useImagePreloader([...hotelImages, ...hostelImages])

  const incrementRooms = () => setRooms((prev) => prev + 1)
  const decrementRooms = () => setRooms((prev) => (prev > 1 ? prev - 1 : 1))
  const incrementMonths = () => setMonths((prev) => prev + 1)
  const decrementMonths = () => setMonths((prev) => (prev > 1 ? prev - 1 : 1))

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality here
    console.log("Search submitted")
  }

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!imagesPreloaded) return

    const hotelTimer = setInterval(() => {
      setNextHotelImage((prev) => (prev + 1) % hotelImages.length)
    }, 5000)

    const hostelTimer = setInterval(() => {
      setNextHostelImage((prev) => (prev + 1) % hostelImages.length)
    }, 5000)

    return () => {
      clearInterval(hotelTimer)
      clearInterval(hostelTimer)
    }
  }, [imagesPreloaded])

  useEffect(() => {
    if (imagesPreloaded) {
      const timer = setTimeout(() => {
        setCurrentHotelImage(nextHotelImage)
      }, 1000) // Delay to allow for fade transition
      return () => clearTimeout(timer)
    }
  }, [nextHotelImage, imagesPreloaded])

  useEffect(() => {
    if (imagesPreloaded) {
      const timer = setTimeout(() => {
        setCurrentHostelImage(nextHostelImage)
      }, 1000) // Delay to allow for fade transition
      return () => clearTimeout(timer)
    }
  }, [nextHostelImage, imagesPreloaded])

  const handleSectionClick = (section: "hotels" | "hostels") => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  const handleBack = () => {
    setExpandedSection(null)
  }

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

  const sectionVariants = {
    initial: { width: "0%", opacity: 0 },
    animate: { width: "50%", opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    exit: { width: "0%", opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    expanded: { width: "80%", opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    collapsed: { width: "20%", opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  }

  const imageVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const detailSectionVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
    exit: { y: "100%", opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } },
  }

  const textRevealVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.5,
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
    hover: {
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  const toggleDetailSection = () => {
    setShowDetailSection((prev) => (prev === "hotels" ? "hostels" : "hotels"))
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
                    className="hover:bg-transparent"
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

          {/* Top section for web view */}
          <div className="hidden md:flex flex-1 flex-col md:flex-row relative">
            <AnimatePresence>
              {!expandedSection && (
                <motion.div
                  className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    className="w-12 h-12 -ml-6 flex items-center justify-center text-white hover:scale-110 transition-transform"
                    onClick={() => handleSectionClick("hostels")}
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    className="w-12 h-12 -mr-6 flex items-center justify-center text-white hover:scale-110 transition-transform"
                    onClick={() => handleSectionClick("hotels")}
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {/* Hotel Section - Left */}
              <motion.section
                key="hotels"
                className="w-full md:w-1/2 bg-gradient-to-b from-[#A31C44] to-[#7A1533] text-white relative overflow-hidden cursor-pointer"
                variants={sectionVariants}
                initial="initial"
                animate={
                  expandedSection === "hotels" ? "expanded" : expandedSection === "hostels" ? "collapsed" : "animate"
                }
                exit="exit"
                onClick={() => handleSectionClick("hotels")}
              >
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 to-transparent">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      key={nextHotelImage}
                      variants={imageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={hotelImages[nextHotelImage] || "/placeholder.svg"}
                        alt="Luxury Hotel Room"
                        fill
                        className="object-cover opacity-30 mix-blend-overlay"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute inset-0">
                    <Image
                      src={hotelImages[currentHotelImage] || "/placeholder.svg"}
                      alt="Luxury Hotel Room"
                      fill
                      className="object-cover opacity-30 mix-blend-overlay"
                    />
                  </div>
                </div>
                <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col justify-between h-full">
                  <AnimatePresence>
                    {expandedSection === "hotels" && (
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-32 left-8 text-white flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBack()
                        }}
                      >
                        <ChevronLeft className="h-6 w-6" />
                        <span>Back</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                  {(!expandedSection || expandedSection === "hotels") && (
                    <>
                      <div className="my-auto py-12">
                      <motion.h2
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                    >
                      {["LUXURY", "COMFORT", "STYLE"].map((word, index) => (
                        <motion.div key={index} className="overflow-hidden">
                          <motion.span className="inline-block" variants={textRevealVariants} custom={index}>
                            {word}
                          </motion.span>
                        </motion.div>
                      ))}
                    </motion.h2>
                    <motion.p
                      className="mb-8 max-w-md text-white/90 text-sm sm:text-base"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      Experience unparalleled luxury in our handpicked selection of premium hotels. Indulge in
                      exceptional service and amenities designed for the discerning traveler.
                    </motion.p>
                        {expandedSection === "hotels" && (
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="flex justify-left mt-16"
                          >
                            <NewButton
                              variant="neutral"
                              className="btn-hotel rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDiscover("hotels")
                              }}
                            >
                              Discover hotels <ChevronRight className="ml-2 h-5 w-5" />
                            </NewButton>
                          </motion.div>
                        )}
                      </div>
                    </>
                  )}
                  {expandedSection === "hostels" && (
                    <div
                      className="h-full flex items-center justify-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSectionClick("hotels")
                      }}
                    >
                      <div className="transform -rotate-90">
                        <span className="text-xl sm:text-2xl font-bold tracking-wider text-white whitespace-nowrap">
                          SWITCH TO HOTELS
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>

              {/* Hostel Section - Right */}
              <motion.section
                key="hostels"
                className="w-full md:w-1/2 bg-gradient-to-b from-[#2A2B2E] to-[#1A1B1E] text-white relative overflow-hidden cursor-pointer"
                variants={sectionVariants}
                initial="initial"
                animate={
                  expandedSection === "hostels" ? "expanded" : expandedSection === "hotels" ? "collapsed" : "animate"
                }
                exit="exit"
                onClick={() => handleSectionClick("hostels")}
              >
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 to-transparent">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      key={nextHostelImage}
                      variants={imageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={hostelImages[nextHostelImage] || "/placeholder.svg"}
                        alt="Vibrant Hostel Room"
                        fill
                        className="object-cover opacity-30 mix-blend-overlay"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute inset-0">
                    <Image
                      src={hostelImages[currentHostelImage] || "/placeholder.svg"}
                      alt="Vibrant Hostel Room"
                      fill
                      className="object-cover opacity-30 mix-blend-overlay"
                    />
                  </div>
                </div>
                <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col justify-between h-full">
                  <AnimatePresence>
                    {expandedSection === "hostels" && (
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-32 left-8 text-white flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBack()
                        }}
                      >
                        <ChevronLeft className="h-6 w-6" />
                        <span>Back</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                  {(!expandedSection || expandedSection === "hostels") && (
                    <>
                      <div className="my-auto py-12">
                      <motion.h2
                      className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                    >
                      {["VIBRANT", "SOCIAL", "AFFORDABLE"].map((word, index) => (
                        <motion.div key={index} className="overflow-hidden">
                          <motion.span className="inline-block" variants={textRevealVariants} custom={index}>
                            {word}
                          </motion.span>
                        </motion.div>
                      ))}
                    </motion.h2>
                    <motion.p
                      className="mb-8 max-w-md text-white/90"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      Connect with fellow travelers in our vibrant hostels. Enjoy budget-friendly accommodations without
                      compromising on experience or location.
                    </motion.p>
                        {expandedSection === "hostels" && (
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="flex justify-left mt-16"
                          >
                            <NewButton
                              variant="neutral"
                              className="btn-hostel rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDiscover("hostels")
                              }}
                            >
                              Discover hostels <ChevronRight className="ml-2 h-5 w-5" />
                            </NewButton>
                          </motion.div>
                        )}
                      </div>
                    </>
                  )}
                  {expandedSection === "hotels" && (
                    <div
                      className="h-full flex items-center justify-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSectionClick("hostels")
                      }}
                    >
                      <div className="transform -rotate-90">
                        <span className="text-2xl font-bold tracking-wider text-white whitespace-nowrap">
                          SWITCH TO HOSTELS
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>
            </AnimatePresence>
          </div>

          {/* Detail Section */}
          <AnimatePresence>
            {(showDetailSection || window.innerWidth < 768) && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-80 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseDetail}
              >
                <motion.div
                  ref={detailSectionRef}
                  className="absolute inset-x-0 top-0 bottom-0 bg-white text-black overflow-y-hidden shadow-2xl scrollbar-hide"
                  variants={{
                    hidden: { y: "100%" },
                    visible: { y: 0 },
                    exit: { y: "100%" },
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <AddNavbar/>
                  <Navbar isLoggedIn={isLoggedIn} userName={userName} />
                  {/* <div className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-[0_4px_6px_-1px_rgba(163,28,68,0.1),0_2px_4px_-2px_rgba(163,28,68,0.1)]">
                    <header className="px-4 py-4">
                      <div className="container mx-auto flex items-center justify-between">
                        <div onClick={() => setShowDetailSection(null)} className="cursor-pointer">
                          <Logo />
                        </div>
                        {isLoggedIn ? (
                  <ProfileDropdown
                    userName={userName}
                    onLogout={handleLogout}
                    className="hover:bg-transparent"
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
                      </div>
                    </header>
                  </div> */}
                  
                  <div className="overflow-y-auto h-full scrollbar-hide mt-16">
                    {/* Hero Section with Search */}
                    <div
                      className={`py-16 ${showDetailSection === "hotels"
                          ? "bg-gradient-to-b from-[#A31C44] to-[#7A1533]"
                          : "bg-gradient-to-b from-[#2A2B2E] to-[#1A1B1E]"
                        }`}
                    >
                      <div className="container mx-auto px-4">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="max-w-5xl mx-auto"
                        >
                          <h2 className="text-4xl font-bold mb-8 text-center text-white font-rock-salt">
                            {showDetailSection === "hotels" ? "Find Your Perfect Hotel" : "Discover Your Ideal Hostel"}
                          </h2>
                          <p className="text-xl text-white text-center mb-8">
                            {showDetailSection === "hotels"
                              ? "Book by hour or day - flexibility that suits your schedule"
                              : "Find your perfect stay in our vibrant hostels"}
                          </p>

                          {/* Update the search form in the Hero Section */}
                          <form
                            onSubmit={handleSearch}
                            className="bg-white rounded-xl shadow-lg p-2 flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center"
                          >
                            {/* Location */}
                            <div className="flex items-center flex-1 min-w-full md:min-w-[200px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
                              <MapPin className="text-gray-400 mr-2 flex-shrink-0" size={20} />
                              <div className="flex flex-col flex-grow">
                                <label htmlFor="location" className="text-xs text-gray-500 font-medium">
                                  Location
                                </label>
                                <input
                                  id="location"
                                  type="text"
                                  placeholder="Which city do you prefer?"
                                  className="outline-none text-sm w-full"
                                  value={location}
                                  onChange={(e) => setLocation(e.target.value)}
                                />
                              </div>
                            </div>

                            {/* Check In */}
                            <div className="flex items-center flex-1 min-w-full md:min-w-[150px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
                              <Calendar className="text-gray-400 mr-2 flex-shrink-0" size={20} />
                              <div className="flex flex-col flex-grow">
                                <label htmlFor="check-in" className="text-xs text-gray-500 font-medium">
                                  Check In
                                </label>
                                <input
                                  id="check-in"
                                  type="text"
                                  placeholder="Add Date"
                                  className="outline-none text-sm w-full"
                                  value={checkIn}
                                  onChange={(e) => setCheckIn(e.target.value)}
                                  onFocus={(e) => ((e.target as HTMLInputElement).type = "date")}
                                  onBlur={(e) => ((e.target as HTMLInputElement).type = "text")}
                                />
                              </div>
                            </div>

                            {showDetailSection === "hotels" ? (
                              <>
                                {bookingType === "hour" ? (
                                  <div className="flex items-center flex-1 min-w-full md:min-w-[150px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
                                    <Clock className="text-gray-400 mr-2 flex-shrink-0" size={20} />
                                    <div className="flex flex-col flex-grow">
                                      <label htmlFor="check-in-time" className="text-xs text-gray-500 font-medium">
                                        Check In Time
                                      </label>
                                      <input
                                        id="check-in-time"
                                        type="time"
                                        className="outline-none text-sm w-full"
                                        value={checkInTime}
                                        onChange={(e) => setCheckInTime(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center flex-1 min-w-full md:min-w-[150px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
                                    <Calendar className="text-gray-400 mr-2 flex-shrink-0" size={20} />
                                    <div className="flex flex-col flex-grow">
                                      <label htmlFor="check-out" className="text-xs text-gray-500 font-medium">
                                        Check Out
                                      </label>
                                      <input
                                        id="check-out"
                                        type="text"
                                        placeholder="Add Date"
                                        className="outline-none text-sm w-full"
                                        value={checkOut}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                        onFocus={(e) => ((e.target as HTMLInputElement).type = "date")}
                                        onBlur={(e) => ((e.target as HTMLInputElement).type = "text")}
                                      />
                                    </div>
                                  </div>
                                )}

                                {bookingType === "hour" && (
                                  <div className="flex items-center flex-1 min-w-full md:min-w-[150px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
                                    <Clock className="text-gray-400 mr-2 flex-shrink-0" size={20} />
                                    <div className="flex flex-col flex-grow">
                                      <label htmlFor="check-out-time" className="text-xs text-gray-500 font-medium">
                                        Check Out Time
                                      </label>
                                      <input
                                        id="check-out-time"
                                        type="time"
                                        className="outline-none text-sm w-full"
                                        value={checkOutTime}
                                        onChange={(e) => setCheckOutTime(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Room */}
                                <div className="flex items-center flex-1 min-w-full md:min-w-[120px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
                                  <Bed className="text-gray-400 mr-2 flex-shrink-0" size={20} />
                                  <div className="flex flex-col flex-grow">
                                    <label className="text-xs text-gray-500 font-medium">Room</label>
                                    <div className="flex items-center">
                                      <button
                                        type="button"
                                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                                        onClick={decrementRooms}
                                      >
                                        <Minus size={14} />
                                      </button>
                                      <span className="mx-2 text-sm">{rooms}</span>
                                      <button
                                        type="button"
                                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                                        onClick={incrementRooms}
                                      >
                                        <Plus size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              // Hostel-specific fields
                              <div className="flex items-center flex-1 min-w-full md:min-w-[150px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
                                <Calendar className="text-gray-400 mr-2 flex-shrink-0" size={20} />
                                <div className="flex flex-col flex-grow">
                                  <label className="text-xs text-gray-500 font-medium">Months</label>
                                  <div className="flex items-center">
                                    <button
                                      type="button"
                                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                                      onClick={decrementMonths}
                                    >
                                      <Minus size={14} />
                                    </button>
                                    <span className="mx-2 text-sm">{months}</span>
                                    <button
                                      type="button"
                                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                                      onClick={incrementMonths}
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Guests */}
                            <div className="flex items-center flex-1 min-w-full md:min-w-[120px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
                              <Users className="text-gray-400 mr-2 flex-shrink-0" size={20} />
                              <div className="flex flex-col flex-grow">
                                <label className="text-xs text-gray-500 font-medium">Guests</label>
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                                    onClick={() => setGuests((prev) => (Number(prev) > 1 ? String(Number(prev) - 1) : "1"))}
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="mx-2 text-sm">{guests}</span>
                                  <button
                                    type="button"
                                    className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                                    onClick={() => setGuests((prev) => String(Number(prev) + 1))}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Search Button */}
                            <div className="flex-none p-2 w-full md:w-auto">
                              <button
                                type="submit"
                                className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors w-full md:w-auto"
                              >
                                <span className="md:hidden">
                                  Search {showDetailSection === "hotels" ? "Hotel" : "Hostel"}
                                </span>
                                <Search size={20} className="hidden md:block" />
                              </button>
                            </div>
                          </form>

                          {/* Booking Type Toggle (only for hotels) */}
                          {showDetailSection === "hotels" && (
                            <div className="mt-4 flex justify-center">
                              <div className="bg-white rounded-full p-1 inline-flex shadow-md">
                                <button
                                  type="button"
                                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${bookingType === "day" ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                  onClick={() => setBookingType("day")}
                                >
                                  Book by Day
                                </button>
                                <button
                                  type="button"
                                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${bookingType === "hour" ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                  onClick={() => setBookingType("hour")}
                                >
                                  Book by Hour
                                </button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </div>

                    <PlaceCard  type={
                          showDetailSection === "hotels" ? "hotel" : "hostel"
                        }/>
                    {/* Property Timeline */}
                    <div className="bg-white w-full">
                      <PropertyTimeline type={showDetailSection === "hotels" ? "hotel" : "hostel"} />
                    </div>

                    {/* Featured Properties */}
                    {/* <div className="bg-gray-50 w-full">
                      <FeaturedProperties type={showDetailSection === "hotels" ? "hotels" : "hostels"} />
                    </div> */}

                    <Features/>
                    <SocialSection/>
                    {/* Reviews Section */}
                    <div className="py-16 bg-white">
                      <TestimonialSection
                        testimonials={showDetailSection === "hotels" ? hotelTestimonials : hostelTestimonials}
                        theme={showDetailSection === "hotels" ? "hotel" : "hostel"}
                      />
                    </div>

                    {/* Footer */}
                    <footer
                      className={`text-white py-12 ${showDetailSection === "hotels" ? "bg-[#A31C44]" : "bg-[#2A2B2E]"}`}
                    >
                      <div className="container mx-auto px-4">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="grid grid-cols-1 md:grid-cols-4 gap-8"
                        >
                          <div>
                            <h4 className="font-bold mb-4">About Us</h4>
                            <p className="text-gray-300">
                              {showDetailSection === "hotels"
                                ? "Discover luxury and comfort with our carefully curated selection of premium hotels."
                                : "Experience vibrant and affordable stays with our network of social hostels."}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-bold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-300">
                              <li>{showDetailSection === "hotels" ? "Hotels" : "Hostels"}</li>
                              <li>Locations</li>
                              <li>Special Offers</li>
                              <li>Contact Us</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold mb-4">Contact</h4>
                            <ul className="space-y-2 text-gray-300">
                              <li>Email: info@hsquare.com</li>
                              <li>Phone: +1 234 567 890</li>
                              <li>Address: 123 Travel Street</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold mb-4">Newsletter</h4>
                            <div className="flex">
                              <input
                                type="email"
                                placeholder="Your email"
                                className="px-4 py-2 rounded-l-md flex-1 text-gray-900"
                              />
                              <button
                                className={`px-4 py-2 rounded-r-md transition-colors ${showDetailSection === "hotels"
                                    ? "bg-[#7A1533] hover:bg-[#5A0F23]"
                                    : "bg-[#1A1B1E] hover:bg-[#0A0B0E]"
                                  }`}
                              >
                                Subscribe
                              </button>
                            </div>
                          </div>
                        </motion.div>
                        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
                          <p>&copy; 2024 HSquare. All rights reserved.</p>
                        </div>
                      </div>
                    </footer>
                  </div>
                </motion.div>
              </motion.div>
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
