"use client"

import { useState, useRef, useCallback, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"
import { DatePicker } from "./DatePicker"
import { RoomGuestSelector } from "./RoomGuestSelector"
import { HourlyTimeSelector } from "./HourlyTimeSelector"
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { fetchLocation } from '@/lib/api/fetchLocation'
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, User, LogIn } from "lucide-react"

const typingAnimation = `
  @keyframes typing {
    0%, 100% { content: ''; }
    3.8% { content: 'W'; }
    7.6% { content: 'Wh'; }
    11.4% { content: 'Whe'; }
    15.2% { content: 'Wher'; }
    19% { content: 'Where'; }
    22.8% { content: 'Where '; }
    26.6% { content: 'Where a'; }
    30.4% { content: 'Where ar'; }
    34.2% { content: 'Where are'; }
    38% { content: 'Where are '; }
    41.8% { content: 'Where are y'; }
    45.6% { content: 'Where are yo'; }
    49.4% { content: 'Where are you'; }
    53.2% { content: 'Where are you '; }
    57% { content: 'Where are you g'; }
    60.8% { content: 'Where are you go'; }
    64.6% { content: 'Where are you goi'; }
    68.4% { content: 'Where are you goin'; }
    72.2% { content: 'Where are you going'; }
    76% { content: 'Where are you going?'; }
    92% { content: 'Where are you going?'; }
  }
`

type AccommodationType = "hotel" | "hostel"
type BookingType = "hourly" | "fulltime"

const hotelImages = [
  "/images/hotels/hotel_1.webp",
  "/images/hotels/hotel_2.webp",
  "/images/hotels/hotel_3.webp",
]

const hostelImages = [
  "/images/hostels/hostel_1.jpg",
  "/images/hostels/hostel_2.jpg",
  "/images/hostels/hostel_3.jpg",
]

interface HeroProps {
  onLoginClick: () => void
  isLoggedIn: boolean
}

export function Hero({ onLoginClick, isLoggedIn }: HeroProps) {
  const [locationPredictions, setLocationPredictions] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [accommodationType, setAccommodationType] = useState<AccommodationType>("hotel")
  const [bookingType, setBookingType] = useState<BookingType>("fulltime")
  const locationInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAnimation, setShowAnimation] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined)
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined)
  const [checkInTime, setCheckInTime] = useState<string>("12")
  const [checkOutTime, setCheckOutTime] = useState<string>("14")
  const [rooms, setRooms] = useState(1)
  const [guests, setGuests] = useState(1)
  const [expandedSection, setExpandedSection] = useState<"hotels" | "hostels" | null>(null)
  const [showDetailSection, setShowDetailSection] = useState<"hotels" | "hostels" | null>(null)
  const [currentHotelImage, setCurrentHotelImage] = useState(0)
  const [currentHostelImage, setCurrentHostelImage] = useState(0)
  const [nextHotelImage, setNextHotelImage] = useState(0)
  const [nextHostelImage, setNextHostelImage] = useState(0)
  const detailSectionRef = useRef<HTMLDivElement>(null)

  // Animation variants
  const sectionVariants = {
    initial: { width: "0%", opacity: 0 },
    animate: { width: "50%", opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    expanded: { width: "80%", opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    collapsed: { width: "20%", opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  }

  const imageVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
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
  }

  const handleSearch = () => {
    if (!location) {
      alert("Please enter a location")
      return
    }

    const params = new URLSearchParams()
    params.set('location', location)
    params.set('propertyType', accommodationType)
    params.set('bookingType', bookingType)

    const checkInDateParam = checkInDate ? format(checkInDate, 'yyyy-MM-dd') : searchParams.get('checkInDate')
    const checkOutDateParam = checkOutDate ? format(checkOutDate, 'yyyy-MM-dd') : searchParams.get('checkOutDate')
    const checkInTimeParam = checkInTime ? `${String(parseInt(checkInTime, 10)).padStart(2, '0')}:00` : searchParams.get('checkInTime')
    const checkOutTimeParam = checkOutTime ? `${String(parseInt(checkOutTime, 10)).padStart(2, '0')}:00` : searchParams.get('checkOutTime')
    const roomsParam = rooms.toString()
    const guestsParam = guests.toString()

    if (checkInDateParam) params.set('checkInDate', checkInDateParam)
    if (checkOutDateParam) params.set('checkOutDate', checkOutDateParam)
    if (checkInTimeParam) params.set('checkInTime', checkInTimeParam)
    if (checkOutTimeParam) params.set('checkOutTime', checkOutTimeParam)
    if (roomsParam) params.set('rooms', roomsParam)
    if (guestsParam) params.set('guests', guestsParam)

    router.push(`/search?${params.toString()}`)
  }

  const handleLocationInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setLocation(query)
    setInputValue(query)

    if (query.length > 2) {
      try {
        const predictions = await fetchLocation(query)
        setLocationPredictions(predictions)
      } catch (error) {
        console.error("Error fetching location predictions:", error)
        setLocationPredictions([])
      }
    } else {
      setLocationPredictions([])
    }

    if (query.length > 0) {
      setShowAnimation(false)
    } else {
      setShowAnimation(true)
    }
  }

  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation)
    setLocationPredictions([])
    locationInputRef.current?.blur()
    setInputValue(selectedLocation)
    setShowAnimation(false)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (e.target.value) {
      setShowAnimation(false)
    } else {
      setShowAnimation(true)
    }
  }

  const handleInputFocus = () => {
    if (inputValue === "") {
      setShowAnimation(false)
    }
  }

  const handleInputBlur = () => {
    if (inputValue === "") {
      setShowAnimation(true)
    }
  }

  const handleCheckInTimeChange = useCallback((times: { checkInTime: string; checkOutTime: string }) => {
    setCheckInTime(times.checkInTime)
    setCheckOutTime(times.checkOutTime)
  }, [setCheckInTime, setCheckOutTime])

  const handleCheckOutTimeChange = useCallback((times: { checkInTime: string; checkOutTime: string }) => {
    setCheckInTime(times.checkInTime)
    setCheckOutTime(times.checkOutTime)
  }, [setCheckInTime, setCheckOutTime])

  const handleCheckInDateChange = useCallback((date: Date | undefined) => {
    setCheckInDate(date)
  }, [setCheckInDate])

  const handleCheckOutDateChange = useCallback((date: Date | undefined) => {
    setCheckOutDate(date)
  }, [setCheckOutDate])

  const handleRoomGuestSelect = (selectedRooms: number, selectedGuests: number) => {
    setRooms(selectedRooms)
    setGuests(selectedGuests)
  }

  const handleSectionClick = (section: "hotels" | "hostels") => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  const handleDiscover = (section: "hotels" | "hostels") => {
    setShowDetailSection(section)
  }

  return (
    <div className="flex flex-1 relative">
      <AnimatePresence>
        {!expandedSection && (
          <motion.div
            className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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

      {/* Hotel Section */}
      <motion.section
        className="w-full md:w-1/2 bg-gradient-to-b from-[#A31C44] to-[#7A1533] text-white relative overflow-hidden cursor-pointer"
        variants={sectionVariants}
        initial="initial"
        animate={expandedSection === "hotels" ? "expanded" : expandedSection === "hostels" ? "collapsed" : "animate"}
        onClick={() => handleSectionClick("hotels")}
      >
        {/* Hotel content */}
        {/* Add hotel section content similar to page.tsx */}
      </motion.section>

      {/* Hostel Section */}
      <motion.section
        className="w-full md:w-1/2 bg-gradient-to-b from-[#2A2B2E] to-[#1A1B1E] text-white relative overflow-hidden cursor-pointer"
        variants={sectionVariants}
        initial="initial"
        animate={expandedSection === "hostels" ? "expanded" : expandedSection === "hotels" ? "collapsed" : "animate"}
        onClick={() => handleSectionClick("hostels")}
      >
        {/* Hostel content */}
        {/* Add hostel section content similar to page.tsx */}
      </motion.section>

      {/* Search Modal */}
      <AnimatePresence>
        {showDetailSection && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Add search form content */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
