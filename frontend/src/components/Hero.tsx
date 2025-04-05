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
type BookingType = "hourly" | "daily"

interface LocationPrediction {
  id: number
  name: string
  city?: string
  country?: string
}

export function HeroSection() {
  const [locationPredictions, setLocationPredictions] = useState<LocationPrediction[]>([])
  const [location, setLocation] = useState('')
  const [accommodationType, setAccommodationType] = useState<AccommodationType>("hotel")
  const [bookingType, setBookingType] = useState<BookingType>("daily")
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

  return (
    <div className="relative min-h-[600px] flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)), url("/images/banner.png")',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-rock-salt">Your Perfect Stay at</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-rock-salt">the Best Price</h2>
        </div>

        <Card className="w-full max-w-6xl mx-auto p-6 bg-white/95 backdrop-blur-sm shadow-lg">
            {/* Travel Type Tabs */}
            <div className="flex justify-center mb-6 text-sm">
              <div className="inline-flex rounded-lg p-1" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    accommodationType === "hotel" ? "bg-gray-800 text-white" : "text-red-600 hover:bg-gray-100"
                  }`}
                  style={{ backgroundColor: accommodationType === "hotel" ? "#1f2937" : "rgba(255, 255, 255, 0.95)" }}
                  onClick={() => setAccommodationType("hotel")}
                >
                  Hotel
                </button>
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    accommodationType === "hostel" ? "bg-gray-800 text-white" : "text-red-600 hover:bg-gray-100"
                  }`}
                  style={{ backgroundColor: accommodationType === "hostel" ? "#1f2937" : "rgba(255, 255, 255, 0.95)" }}
                  onClick={() => setAccommodationType("hostel")}
                >
                  Hostel
                </button>
              </div>
            </div>

            {/* Search Form */}
            <div className="space-y-4">
              <div
                className={`grid gap-4 ${accommodationType === "hostel" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-4"}`}
              >
                {/* Location */}
                <div className={`relative ${accommodationType === "hostel" ? "md:col-span-1" : ""}`}>
                  <label className="text-xs text-gray-500 mb-1 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                    ref={inputRef}
                      type="text"
                      className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 truncate h-10"
                    value={inputValue}
                    onChange={handleLocationInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                  {showAnimation && (
                    <span
                      className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none before:content-[''] before:inline-block before:animate-[typing_5s_steps(22,end)_infinite]"
                      aria-hidden="true"
                    ></span>
                  )}
                </div>
                {locationPredictions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {locationPredictions.map((prediction, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                        onClick={() => handleLocationSelect(prediction.name)}
                      >
                        {prediction.name}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>

                {/* Check In */}
                <div className={accommodationType === "hostel" ? "md:col-span-1" : ""}>
                  <label className="text-xs text-gray-500 mb-1 block">Check in</label>
                <DatePicker onChange={handleCheckInDateChange} />
                </div>

                {/* Check Out / Time Selection / Months */}
                <div className={accommodationType === "hostel" ? "md:col-span-1" : ""}>
                  {accommodationType === "hotel" && bookingType === "daily" && (
                    <>
                      <label className="text-xs text-gray-500 mb-1 block">Check out</label>
                    <DatePicker onChange={handleCheckOutDateChange} />
                    </>
                  )}
                {accommodationType === "hotel" && bookingType === "hourly" && <HourlyTimeSelector onChange={handleCheckInTimeChange} />}
                  {accommodationType === "hostel" && (
                    <>
                      <label className="text-xs text-gray-500 mb-1 block">Duration</label>
                      <Select defaultValue="1">
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Select months" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 month</SelectItem>
                          <SelectItem value="2">2 months</SelectItem>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>

                {/* Rooms and Guests */}
                {accommodationType === "hotel" && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Rooms & Guests</label>
                    <RoomGuestSelector
                    onSelect={handleRoomGuestSelect}
                    initialRooms={rooms}
                    initialGuests={guests}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between mt-4">
              {/* Radio Buttons (only shown for Hotel) */}
              {accommodationType === "hotel" && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="hourly"
                      name="booking-type"
                      checked={bookingType === "hourly"}
                      onChange={() => setBookingType("hourly")}
                      className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                    />
                    <label htmlFor="hourly" className="text-sm font-medium text-red-600">
                      Hourly
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="daily"
                      name="booking-type"
                      checked={bookingType === "daily"}
                      onChange={() => setBookingType("daily")}
                      className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                    />
                    <label htmlFor="daily" className="text-sm font-medium text-red-600">
                      Fulltime
                    </label>
                  </div>
                </div>
              )}

              {/* Search Button */}
            <Button className={`px-8 bg-red-600 hover:bg-red-700 ${accommodationType === "hostel" ? "ml-auto" : ""}`} onClick={handleSearch}>
                Search
              </Button>
            </div>
        </Card>
      </div>
      <style jsx>{`
        ${typingAnimation}
      `}</style>
    </div>
  )
}
