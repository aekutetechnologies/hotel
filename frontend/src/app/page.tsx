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
import { HeroSection } from "@/components/Hero"

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
  const [isLoaded, setIsLoaded] = useState(false)
  const [expandedSection, setExpandedSection] = useState<"hotels" | "hostels" | null>(null)
  const [currentHotelImage, setCurrentHotelImage] = useState(0)
  const [currentHostelImage, setCurrentHostelImage] = useState(0)
  const [showDetailSection, setShowDetailSection] = useState<"hotels" | "hostels" | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
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

  const imagesPreloaded = useImagePreloader([...hotelImages, ...hostelImages])

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
    setShowDetailSection(section)
  }

  const handleCloseDetail = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowDetailSection(null)
    }
  }

  const handleLoginClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoggedIn(!isLoggedIn)
    console.log("Login status changed:", !isLoggedIn) // Add this line
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
    return <div>Loading...</div> // Or any loading indicator you prefer
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Navbar for web view */}
      {!showDetailSection && (
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
                      >
                        <button
                          className="inline-flex items-center border-2 border-white px-6 py-3 rounded-full hover:bg-white hover:text-[#A31C44] transition-colors text-sm sm:text-base"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDiscover("hotels")
                          }}
                        >
                          Discover hotels <ChevronRight className="ml-2 h-5 w-5" />
                        </button>
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
                      >
                        <button
                          className="inline-flex items-center border-2 border-white px-6 py-3 rounded-full hover:bg-white hover:text-[#2A2B2E] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDiscover("hostels")
                          }}
                        >
                          Discover hostels <ChevronRight className="ml-2 h-5 w-5" />
                        </button>
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
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseDetail}
          >
            <motion.div
              ref={detailSectionRef}
              className="absolute inset-x-0 md:top-[15vh] top-0 bottom-0 bg-white text-black overflow-y-auto shadow-2xl scrollbar-hide"
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
              <div className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
                <header className="px-4 py-4">
                  <div className="container mx-auto flex items-center justify-between">
                    <Logo />
                    <div className="flex items-center space-x-4">
                      {/* Switch Button */}
                      <div className="flex items-center justify-center space-x-2 md:space-x-4">
                        <span
                          className={`font-medium text-xs md:text-base ${showDetailSection === "hotels" ? "text-[#A31C44]" : "text-gray-500"}`}
                        >
                          Hotels
                        </span>
                        <div
                          onClick={toggleDetailSection}
                          className={`relative w-12 md:w-16 h-6 md:h-8 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                            showDetailSection === "hotels" ? "bg-[#A31C44]" : "bg-[#2A2B2E]"
                          }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-4 md:w-6 h-4 md:h-6 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                              showDetailSection === "hotels" ? "translate-x-0" : "translate-x-6 md:translate-x-8"
                            }`}
                          />
                        </div>
                        <span
                          className={`font-medium text-xs md:text-base ${showDetailSection === "hostels" ? "text-[#2A2B2E]" : "text-gray-500"}`}
                        >
                          Hostels
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleLoginClick}
                      className={`flex items-center justify-center px-2 md:px-4 py-1 md:py-2 rounded-full hover:bg-opacity-90 transition-colors text-xs md:text-base ${
                        showDetailSection === "hotels" ? "bg-[#A31C44] text-white" : "bg-[#2A2B2E] text-white"
                      }`}
                    >
                      {isLoggedIn ? (
                        <>
                          <User className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                          <span className="hidden md:inline">Profile</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                          <span className="hidden md:inline">Login</span>
                        </>
                      )}
                    </button>
                  </div>
                </header>
              </div>
              <div className="overflow-y-auto h-full scrollbar-hide px-4">
                {/* Hero Section with Search */}
                <HeroSection
                  showDetailSection={showDetailSection}
                  setShowDetailSection={setShowDetailSection}
                  bookingType={bookingType}
                  setBookingType={setBookingType}
                />

                {/* Featured Properties */}
                <div className="py-16 bg-gray-50">
                  <div className="container mx-auto px-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-3xl font-bold mb-8">
                        {showDetailSection === "hotels" ? "Featured Hotels" : "Popular Hostels"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(showDetailSection === "hotels" ? hotelImages : hostelImages).map((image, index) => (
                          <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
                            <div className="relative h-48">
                              <Image
                                src={image || "/placeholder.svg"}
                                alt={
                                  showDetailSection === "hotels"
                                    ? `Luxury Hotel ${index + 1}`
                                    : `Vibrant Hostel ${index + 1}`
                                }
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <h4 className="font-bold mb-2">
                                {showDetailSection === "hotels"
                                  ? `Luxury Hotel ${index + 1}`
                                  : `Vibrant Hostel ${index + 1}`}
                              </h4>
                              <p className="text-gray-600 mb-2">
                                {showDetailSection === "hotels" ? "City Center Location" : "Near Popular Attractions"}
                              </p>
                              <div className="flex justify-between items-center">
                                <span
                                  className={`font-bold ${showDetailSection === "hotels" ? "text-[#A31C44]" : "text-[#2A2B2E]"}`}
                                >
                                  {showDetailSection === "hotels"
                                    ? `$${199 + index * 50}/night`
                                    : `$${29 + index * 10}/night`}
                                </span>
                                <div className="flex items-center">
                                  <span className="text-yellow-400">★★★★★</span>
                                  <span className="text-gray-600 text-sm ml-1">
                                    ({showDetailSection === "hotels" ? 100 + index * 10 : 50 + index * 5})
                                  </span>
                                </div>
                              </div>
                              {showDetailSection === "hostels" && (
                                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                                  <Users className="w-4 h-4" />
                                  <span>{4 + index * 2} bed dorm</span>
                                  <Wifi className="w-4 h-4 ml-2" />
                                  <span>Free WiFi</span>
                                  <Coffee className="w-4 h-4 ml-2" />
                                  <span>Breakfast included</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="py-16">
                  <div className="container mx-auto px-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mb-8"
                    >
                      <h3 className="text-3xl font-bold mb-8 text-center">What Our Guests Say</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                              <div>
                                <h4 className="font-bold">
                                  {showDetailSection === "hotels" ? "John Doe" : "Sarah Traveler"}
                                </h4>
                                <div className="flex text-yellow-400">★★★★★</div>
                              </div>
                            </div>
                            <p className="text-gray-600">
                              {showDetailSection === "hotels"
                                ? "Amazing experience! The hotel exceeded all our expectations. Will definitely come back again."
                                : "Great atmosphere and met so many cool people! The staff was super friendly and helpful."}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
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
                            className={`px-4 py-2 rounded-r-md transition-colors ${
                              showDetailSection === "hotels"
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
  )
}

