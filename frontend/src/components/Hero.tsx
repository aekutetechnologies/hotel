"use client"

import { useState, useRef, useCallback, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, CalendarIcon, Clock, Bed, Users, Minus, Plus, Search } from "lucide-react"
import { DatePicker } from "./DatePicker"
import { RoomGuestSelector } from "./RoomGuestSelector"
import { HourlyTimeSelector } from "./HourlyTimeSelector"
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { fetchLocation } from '@/lib/api/fetchLocation'
import { motion } from "framer-motion"

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

interface HeroSectionProps {
  showDetailSection: "hotels" | "hostels" | null;
  setShowDetailSection: (section: "hotels" | "hostels" | null) => void;
  bookingType: "day" | "hour";
  setBookingType:  (bookingType: "day" | "hour") => void;
}

export function HeroSection({ showDetailSection, setShowDetailSection, bookingType, setBookingType }: HeroSectionProps) {
  const [locationPredictions, setLocationPredictions] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [accommodationType, setAccommodationType] = useState<"hotel" | "hostel">("hotel")
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
  const [guests, setGuests] = useState("1")
  const [months, setMonths] = useState(1)

  const incrementRooms = () => setRooms((prev) => prev + 1)
  const decrementRooms = () => setRooms((prev) => (prev > 1 ? prev - 1 : 1))
  const incrementMonths = () => setMonths((prev) => prev + 1)
  const decrementMonths = () => setMonths((prev) => (prev > 1 ? prev - 1 : 1))

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

  const handleLocationChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setLocation(value)

    if (value.length > 2) {
      const predictions = await fetchLocation(value)
      setLocationPredictions(predictions)
    } else {
      setLocationPredictions([])
    }
  }, [])

  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation)
    setLocationPredictions([])
    locationInputRef.current?.blur()
  }

  const handleRoomGuestSelect = (selectedRooms: number, selectedGuests: number) => {
    setRooms(selectedRooms)
    setGuests(selectedGuests)
  }


  return (
    <div
      className={`py-16 ${
        showDetailSection === "hotels"
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
          <h2 className="text-4xl font-bold mb-8 text-center text-white">
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
                  onChange={handleLocationChange}
                  ref={locationInputRef}
                />
              </div>
            </div>

            {/* Check In */}
            <div className="flex items-center flex-1 min-w-full md:min-w-[150px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
              <CalendarIcon className="text-gray-400 mr-2 flex-shrink-0" size={20} />
              <div className="flex flex-col flex-grow">
                <label htmlFor="check-in" className="text-xs text-gray-500 font-medium">
                  Check In
                </label>
                <DatePicker
                  date={checkInDate}
                  setDate={setCheckInDate}
                  placeholder="Add Date"
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
                      <HourlyTimeSelector value={checkInTime} setValue={setCheckInTime} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center flex-1 min-w-full md:min-w-[150px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
                    <CalendarIcon className="text-gray-400 mr-2 flex-shrink-0" size={20} />
                    <div className="flex flex-col flex-grow">
                      <label htmlFor="check-out" className="text-xs text-gray-500 font-medium">
                        Check Out
                      </label>
                      <DatePicker
                        date={checkOutDate}
                        setDate={setCheckOutDate}
                        placeholder="Add Date"
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
                      <HourlyTimeSelector value={checkOutTime} setValue={setCheckOutTime} />
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
                <CalendarIcon className="text-gray-400 mr-2 flex-shrink-0" size={20} />
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
              <Button
                type="submit"
                className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors w-full md:w-auto"
              >
                <span className="md:hidden">
                  Search {showDetailSection === "hotels" ? "Hotel" : "Hostel"}
                </span>
                <Search size={20} className="hidden md:block" />
              </Button>
            </div>
          </form>

          {/* Booking Type Toggle (only for hotels) */}
          {showDetailSection === "hotels" && (
            <div className="mt-4 flex justify-center">
              <div className="bg-white rounded-full p-1 inline-flex shadow-md">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    bookingType === "day" ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setBookingType("day")}
                >
                  Book by Day
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    bookingType === "hour" ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
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
  )
}
