"use client"

import { useState, useRef, useCallback, ChangeEvent, useEffect } from "react"
import { MapPin, CalendarDays, Clock, Bed, Users, Minus, Plus, Search, Calendar } from "lucide-react"
import { useRouter, useSearchParams } from 'next/navigation'
import { format, addDays, startOfTomorrow, addMonths, isValid, isBefore, parse, parseISO } from 'date-fns'
import { fetchLocation } from '@/lib/api/fetchLocation'

interface SearchFormProps {
  sectionType: "hotels" | "hostels"
}

// Define the interface for location predictions based on the API response
interface LocationPrediction {
  id: number
  name: string
  city: string
  country: string
}

export function SearchForm({ sectionType }: SearchFormProps) {
  const [locationPredictions, setLocationPredictions] = useState<LocationPrediction[]>([])
  const [location, setLocation] = useState("Mumbai")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [checkInTime, setCheckInTime] = useState("")
  const [checkOutTime, setCheckOutTime] = useState("")
  const [rooms, setRooms] = useState(1)
  const [guests, setGuests] = useState(1)
  const [bookingType, setBookingType] = useState<"day" | "hour" | "month">(sectionType === "hostels" ? "month" : "day")
  const [months, setMonths] = useState(1)
  const [isFocused, setIsFocused] = useState(false)
  const [minCheckInDate, setMinCheckInDate] = useState("")
  const [minCheckOutDate, setMinCheckOutDate] = useState("")
  const [minCheckInTime, setMinCheckInTime] = useState("")
  const [minCheckOutTime, setMinCheckOutTime] = useState("")
  const locationInputRef = useRef<HTMLInputElement>(null)
  const checkInRef = useRef<HTMLInputElement>(null)
  const checkOutRef = useRef<HTMLInputElement>(null)
  const checkInTimeRef = useRef<HTMLInputElement>(null)
  const checkOutTimeRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize date and time values when component mounts
  useEffect(() => {
    const today = new Date()
    const tomorrow = addDays(today, 1)
    
    // Format dates for form inputs (YYYY-MM-DD)
    const formattedToday = format(today, 'yyyy-MM-dd')
    const formattedTomorrow = format(tomorrow, 'yyyy-MM-dd')
    
    // Set minimum dates
    setMinCheckInDate(formattedToday)
    setMinCheckOutDate(formattedToday)
    
    // Prefill the dates
    setCheckIn(formattedToday)
    
    // If hostel (monthly booking), calculate checkout date based on months
    if (sectionType === "hostels") {
      const checkoutDate = addMonths(today, months)
      setCheckOut(format(checkoutDate, 'yyyy-MM-dd'))
    } else {
      // For hotels, set checkout based on booking type
      if (bookingType === "day") {
        setCheckOut(formattedTomorrow)
      }
      
      // Handle time prefilling for hourly bookings
      if (bookingType === "hour") {
        const currentHour = today.getHours()
        const nextHour = (currentHour + 1) % 24
        
        // Format times (HH:MM)
        const currentTime = format(today, 'HH:mm')
        const nextHourTime = `${nextHour.toString().padStart(2, '0')}:00`
        const twoHoursLaterTime = `${((currentHour + 2) % 24).toString().padStart(2, '0')}:00`
        
        // Set minimum times
        setMinCheckInTime(currentTime)
        setMinCheckOutTime(nextHourTime)
        
        // Prefill the times
        setCheckInTime(nextHourTime)
        setCheckOutTime(twoHoursLaterTime)
      }
    }
  }, [sectionType, bookingType, months])

  // Update checkout date when checkin date or months change for monthly booking
  useEffect(() => {
    if (bookingType === "month" && checkIn) {
      try {
        const checkInDate = parseISO(checkIn)
        if (isValid(checkInDate)) {
          const checkOutDate = addMonths(checkInDate, months)
          setCheckOut(format(checkOutDate, 'yyyy-MM-dd'))
        }
      } catch (error) {
        console.error("Invalid date format:", error)
      }
    }
  }, [checkIn, months, bookingType])

  // Update minimum check-out date when check-in date changes
  useEffect(() => {
    if (checkIn) {
      try {
        const checkInDate = parseISO(checkIn)
        if (isValid(checkInDate)) {
          setMinCheckOutDate(checkIn)
          
          // If check-out date is before new check-in date, update it
          if (checkOut && isBefore(parseISO(checkOut), checkInDate)) {
            setCheckOut(checkIn)
          }
        }
      } catch (error) {
        console.error("Invalid date format:", error)
      }
    }
  }, [checkIn, checkOut])

  // Update minimum check-out time when check-in time changes
  useEffect(() => {
    if (checkInTime && checkIn === checkOut) {
      setMinCheckOutTime(checkInTime)
      
      // If check-out time is before check-in time on the same day, update it
      if (checkOutTime && checkOutTime <= checkInTime) {
        // Set check-out time to be 2 hours after check-in time
        const [hours, minutes] = checkInTime.split(':').map(Number)
        const checkOutHours = (hours + 2) % 24
        setCheckOutTime(`${checkOutHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
      }
    }
  }, [checkInTime, checkOutTime, checkIn, checkOut])

  const incrementRooms = () => setRooms((prev) => prev < 5 ? prev + 1 : 5)
  const decrementRooms = () => setRooms((prev) => (prev > 1 ? prev - 1 : 1))
  
  const incrementMonths = () => {
    const newMonths = months < 12 ? months + 1 : 12
    setMonths(newMonths)
    
    // Update checkout date when months change for monthly booking
    if (bookingType === "month" && checkIn) {
      try {
        const checkInDate = parseISO(checkIn)
        if (isValid(checkInDate)) {
          const checkOutDate = addMonths(checkInDate, newMonths)
          setCheckOut(format(checkOutDate, 'yyyy-MM-dd'))
        }
      } catch (error) {
        console.error("Error updating checkout date:", error)
      }
    }
  }
  
  const decrementMonths = () => {
    if (months <= 1) return
    
    const newMonths = months - 1
    setMonths(newMonths)
    
    // Update checkout date when months change for monthly booking
    if (bookingType === "month" && checkIn) {
      try {
        const checkInDate = parseISO(checkIn)
        if (isValid(checkInDate)) {
          const checkOutDate = addMonths(checkInDate, newMonths)
          setCheckOut(format(checkOutDate, 'yyyy-MM-dd'))
        }
      } catch (error) {
        console.error("Error updating checkout date:", error)
      }
    }
  }
  
  // Update incrementGuests to respect max guests per room for hotels
  const incrementGuests = () => {
    if (sectionType === "hotels") {
      const maxGuests = rooms * 3;
      setGuests((prev) => prev < maxGuests ? prev + 1 : maxGuests);
    } else {
      setGuests((prev) => prev < 10 ? prev + 1 : 10);
    }
  }
  
  // Update decrementGuests to maintain minimum of 1 guest
  const decrementGuests = () => setGuests((prev) => (prev > 1 ? prev - 1 : 1))
  
  // Update guests when rooms change for hotels
  useEffect(() => {
    if (sectionType === "hotels") {
      const maxGuests = rooms * 3;
      if (guests > maxGuests) {
        setGuests(maxGuests);
      }
    }
  }, [rooms, sectionType, guests]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!location) {
      alert("Please enter a location")
      return
    }

    // Validate dates and times
    const now = new Date()
    const checkInDate = parseISO(checkIn)
    
    if (isBefore(checkInDate, startOfTomorrow()) && format(checkInDate, 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd')) {
      alert("Check-in date cannot be in the past")
      return
    }
    
    // Only validate checkout for daily bookings in hotels
    if (sectionType === "hotels" && bookingType === "day" && checkOut) {
      const checkOutDate = parseISO(checkOut)
      if (isBefore(checkOutDate, checkInDate)) {
        alert("Check-out date cannot be before check-in date")
        return
      }
    }
    
    // Only validate time for hourly bookings in hotels
    if (sectionType === "hotels" && bookingType === "hour") {
      if (checkIn === format(now, 'yyyy-MM-dd') && checkInTime < format(now, 'HH:mm')) {
        alert("Check-in time cannot be in the past")
        return
      }
      
      if (checkOutTime && checkIn === checkOut && checkOutTime <= checkInTime) {
        alert("Check-out time must be after check-in time")
        return
      }
    }

    const params = new URLSearchParams()
    params.set('location', location)
    params.set('propertyType', sectionType === "hotels" ? "hotel" : "hostel")
    
    // Set the booking type parameter based on property type
    if (sectionType === "hostels") {
      // Always use monthly booking for hostels
      params.set('bookingType', "monthly")
    } else {
      // For hotels, use either daily or hourly
    params.set('bookingType', bookingType === "day" ? "daily" : "hourly")
    }

    // Set check-in date
    if (checkIn) params.set('checkInDate', checkIn)
    
    // Set check-out date based on booking type
    if (sectionType === "hostels") {
      // For hostels, always set checkout date (monthly booking)
      if (checkOut) params.set('checkOutDate', checkOut)
      // Set months parameter for hostels
      params.set('months', months.toString())
    } else if (sectionType === "hotels") {
      // For hotels, set parameters based on booking type
      if (bookingType === "day") {
        // For daily booking, set checkout date
        if (checkOut) params.set('checkOutDate', checkOut)
      } else if (bookingType === "hour") {
        // For hourly booking, set time parameters
      if (checkInTime) params.set('checkInTime', checkInTime)
      if (checkOutTime) params.set('checkOutTime', checkOutTime)
    }
      // Set rooms parameter for hotels
      params.set('rooms', rooms.toString())
    }
    
    // Always set guests parameter
    params.set('guests', guests.toString())

    router.push(`/search?${params.toString()}`)
  }

  const handleLocationInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setLocation(query)

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
  }

  const handleLocationSelect = (selectedLocation: LocationPrediction) => {
    setLocation(selectedLocation.name)
    setLocationPredictions([])
    locationInputRef.current?.blur()
  }

  // Update check-in date handler
  const handleCheckInChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setCheckIn(newDate)
    
    // If booking type is monthly, update checkout date based on months
    if (bookingType === "month") {
      try {
        const checkInDate = parseISO(newDate)
        if (isValid(checkInDate)) {
          const checkOutDate = addMonths(checkInDate, months)
          setCheckOut(format(checkOutDate, 'yyyy-MM-dd'))
        }
      } catch (error) {
        console.error("Error updating checkout date:", error)
      }
    } else {
      // For other booking types, ensure checkout is not before checkin
      if (checkOut && isBefore(parseISO(checkOut), parseISO(newDate))) {
        setCheckOut(newDate)
      }
    }
  }

  // Update check-in time handler
  const handleCheckInTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setCheckInTime(newTime)
    
    // If check-out is on the same day and time is earlier, adjust check-out time
    if (checkOut === checkIn && checkOutTime && checkOutTime <= newTime) {
      const [hours, minutes] = newTime.split(':').map(Number)
      const newCheckOutHours = (hours + 2) % 24
      setCheckOutTime(`${newCheckOutHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
    }
  }

  // Handle booking type change with appropriate updates
  const handleBookingTypeChange = (type: "day" | "hour" | "month") => {
    // Restrict booking types based on section type
    if (sectionType === "hostels" && type !== "month") {
      return; // Only allow "month" for hostels
    }
    if (sectionType === "hotels" && type === "month") {
      return; // Don't allow "month" for hotels
    }
    
    setBookingType(type)
    
    // Update the checkout date if switching to monthly booking
    if (type === "month" && checkIn) {
      try {
        const checkInDate = parseISO(checkIn)
        if (isValid(checkInDate)) {
          const checkOutDate = addMonths(checkInDate, months)
          setCheckOut(format(checkOutDate, 'yyyy-MM-dd'))
        }
      } catch (error) {
        console.error("Error updating checkout date:", error)
      }
    } else if (type === "day" && checkIn) {
      // For daily booking, set checkout to next day after checkin
      try {
        const checkInDate = parseISO(checkIn)
        if (isValid(checkInDate)) {
          const checkOutDate = addDays(checkInDate, 1)
          setCheckOut(format(checkOutDate, 'yyyy-MM-dd'))
        }
      } catch (error) {
        console.error("Error updating checkout date:", error)
      }
    }
  }

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl shadow-lg p-2 flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center"
      >
        {/* Location */}
        <div className="flex items-center flex-1 min-w-full md:min-w-[200px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="flex flex-col flex-grow relative">
            <label 
              htmlFor="location" 
              className={`text-xs font-medium transition-all duration-200 ${
                location || isFocused
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              Location
            </label>
            <div className="relative">
            <input
              id="location"
              ref={locationInputRef}
              type="text"
                placeholder=""
                className="outline-none text-sm w-full cursor-pointer"
              value={location}
              onChange={handleLocationInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <MapPin className="h-4 w-4 text-black" />
              </div>
            </div>
            {locationPredictions.length > 0 && (
              <ul className="absolute z-10 w-full mt-10 bg-white border border-gray-300 rounded-md shadow-lg">
                {locationPredictions.map((prediction) => (
                  <li
                    key={prediction.id}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    onClick={() => handleLocationSelect(prediction)}
                  >
                    {prediction.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Check In */}
        <div className="flex items-center flex-1 min-w-full md:min-w-[180px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="flex flex-col flex-grow">
            <label htmlFor="check-in" className="text-xs text-gray-500 font-medium">
              Check In Date
            </label>
            <div className="relative cursor-pointer">
            <input
              id="check-in"
              ref={checkInRef}
              type="date"
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              value={checkIn}
              min={minCheckInDate}
              onChange={handleCheckInChange}
              />
              <div className="flex items-center justify-between w-full pr-2">
                <span className="text-sm">{checkIn ? format(parseISO(checkIn), 'dd MMM yyyy') : ''}</span>
                <CalendarDays className="h-4 w-4 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Conditional fields based on property type and booking type */}
        {sectionType === "hotels" && bookingType === "hour" && (
          // Show check-in time for hourly booking
              <div className="flex items-center flex-1 min-w-full md:min-w-[90px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
                <div className="flex flex-col flex-grow">
                  <label htmlFor="check-in-time" className="text-xs text-gray-500 font-medium">
                    Check In Time
                  </label>
              <div className="relative cursor-pointer" onClick={() => checkInTimeRef.current?.focus()}>
                  <input
                    id="check-in-time"
                    ref={checkInTimeRef}
                    type="time"
                    className="outline-none text-sm w-full cursor-pointer"
                    value={checkInTime}
                    min={checkIn === minCheckInDate ? minCheckInTime : undefined}
                    onChange={handleCheckInTimeChange}
                  />
                </div>
              </div>
          </div>
        )}

        {sectionType === "hotels" && bookingType === "day" && (
          // Show check-out date only for daily booking
              <div className="flex items-center flex-1 min-w-full md:min-w-[180px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
                <div className="flex flex-col flex-grow">
                  <label htmlFor="check-out" className="text-xs text-gray-500 font-medium">
                Check Out Date
                  </label>
              <div className="relative cursor-pointer">
                  <input
                    id="check-out"
                    ref={checkOutRef}
                    type="date"
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                    value={checkOut}
                    min={minCheckOutDate}
                    onChange={(e) => setCheckOut(e.target.value)}
                />
                <div className="flex items-center justify-between w-full pr-2">
                  <span className="text-sm">{checkOut ? format(parseISO(checkOut), 'dd MMM yyyy') : ''}</span>
                  <CalendarDays className="h-4 w-4 text-black" />
                </div>
              </div>
                </div>
              </div>
            )}

        {sectionType === "hotels" && bookingType === "hour" && (
          // Show check-out time only for hourly booking
              <div className="flex items-center flex-1 min-w-full md:min-w-[90px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
                <div className="flex flex-col flex-grow">
                  <label htmlFor="check-out-time" className="text-xs text-gray-500 font-medium">
                    Check Out Time
                  </label>
              <div className="relative cursor-pointer" onClick={() => checkOutTimeRef.current?.focus()}>
                  <input
                    id="check-out-time"
                    ref={checkOutTimeRef}
                    type="time"
                    className="outline-none text-sm w-full cursor-pointer"
                    value={checkOutTime}
                    min={checkIn === checkOut ? minCheckOutTime : undefined}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                  />
              </div>
            </div>
          </div>
        )}

        {/* Show Months field for hostels */}
        {sectionType === "hostels" && (
          <div className="flex items-center flex-1 min-w-full md:min-w-[90px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
            <div className="flex flex-col flex-grow">
              <label className="text-xs text-gray-500 font-medium">Duration (Months)</label>
              <div className="flex items-center relative">
                <div className="flex items-center flex-grow">
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
                {/* <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-2 pointer-events-none">
                  <CalendarDays className="h-6 w-6 text-black" />
                </div> */}
              </div>
                </div>
              </div>
            )}

        {/* Show Rooms field for hotels */}
        {sectionType === "hotels" && (
            <div className="flex items-center flex-1 min-w-full md:min-w-[80px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
              <div className="flex flex-col flex-grow">
                <label className="text-xs text-gray-500 font-medium">Rooms <span className="text-xs text-gray-400">(max 5)</span></label>
              <div className="flex items-center relative">
                <div className="flex items-center flex-grow">
                  <button
                    type="button"
                    className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                    onClick={decrementRooms}
                    disabled={rooms <= 1}
                    aria-label="Decrease rooms"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="mx-2 text-sm">{rooms}</span>
                  <button
                    type="button"
                    className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                    onClick={incrementRooms}
                    disabled={rooms >= 5}
                    aria-label="Increase rooms"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guests */}
        <div className="flex items-center flex-1 min-w-full md:min-w-[80px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="flex flex-col flex-grow">
            <label className="text-xs text-gray-500 font-medium">
              Guests 
              {sectionType === "hotels" ? (
                <span className="text-xs text-gray-400">(max 3 per room)</span>
              ) : (
                <span className="text-xs text-gray-400">(max 2)</span>
              )}
            </label>
            <div className="flex items-center relative">
              <div className="flex items-center flex-grow">
              <button
                type="button"
                className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                onClick={decrementGuests}
                disabled={guests <= 1}
                aria-label="Decrease guests"
              >
                <Minus size={14} />
              </button>
              <span className="mx-2 text-sm">{guests}</span>
              <button
                type="button"
                className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                onClick={incrementGuests}
                disabled={sectionType === "hotels" ? guests >= rooms * 3 : guests >= 2}
                aria-label="Increase guests"
              >
                <Plus size={14} />
              </button>
              </div>
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
              Search {sectionType === "hotels" ? "Hotel" : "Hostel"}
            </span>
            <Search size={20} className="hidden md:block" />
          </button>
        </div>
      </form>

      {/* Booking Type Toggle - show options based on property type */}
      <div className="mt-4 flex justify-center">
        {/* Only show toggle for hotels, since hostels have only one option */}
      {sectionType === "hotels" && (
          <div className="bg-white rounded-full p-1 inline-flex shadow-md">
            <button
              type="button"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                bookingType === "day" ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handleBookingTypeChange("day")}
            >
              Book by Day
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                bookingType === "hour" ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handleBookingTypeChange("hour")}
            >
              Book by Hour
            </button>
          </div>
        )}
        </div>
    </>
  )
} 