"use client"

import { useState, useRef, useCallback, ChangeEvent, useEffect } from "react"
import { MapPin, CalendarDays, Clock, Bed, Users, Minus, Plus, Search, Calendar } from "lucide-react"
import { useRouter, useSearchParams } from 'next/navigation'
import { format, addDays, startOfTomorrow, addMonths, isValid, isBefore, parse, parseISO } from 'date-fns'
import { fetchLocation } from '@/lib/api/fetchLocation'
import { toast } from 'react-toastify'

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
  const [bookingType, setBookingType] = useState<"day" | "hour" | "month" | "year">(sectionType === "hostels" ? "month" : "day")
  const [months, setMonths] = useState(1)
  const [years, setYears] = useState(1)
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
    
    // If hostel, calculate checkout date based on booking type
    if (sectionType === "hostels") {
      if (bookingType === "month") {
        const checkoutDate = addMonths(today, months)
        setCheckOut(format(checkoutDate, 'yyyy-MM-dd'))
      } else if (bookingType === "year") {
        const checkoutDate = addMonths(today, years * 12)
        setCheckOut(format(checkoutDate, 'yyyy-MM-dd'))
      }
    } else {
      // For hotels, set checkout based on booking type
      if (bookingType === "day") {
        setCheckOut(formattedTomorrow)
      }
      
      // Handle time prefilling for hourly bookings
      if (bookingType === "hour") {
        const currentHour = today.getHours()
        // Always set checkin time to at least the next hour
        const nextHour = currentHour + 1
        
        // Format times (HH:MM)
        const nextHourTime = `${nextHour.toString().padStart(2, '0')}:00`
        const twoHoursLaterTime = `${(nextHour + 2 < 24 ? nextHour + 2 : nextHour + 2 - 24).toString().padStart(2, '0')}:00`
        
        // Set minimum times
        setMinCheckInTime(nextHourTime)
        setMinCheckOutTime(twoHoursLaterTime)
        
        // Prefill the times
        setCheckInTime(nextHourTime)
        setCheckOutTime(twoHoursLaterTime)
      }
    }
  }, [sectionType, bookingType, months, years])

  // Update checkout date when checkin date or months/years change for long-term booking
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
    } else if (bookingType === "year" && checkIn) {
      try {
        const checkInDate = parseISO(checkIn)
        if (isValid(checkInDate)) {
          const checkOutDate = addMonths(checkInDate, years * 12)
          setCheckOut(format(checkOutDate, 'yyyy-MM-dd'))
        }
      } catch (error) {
        console.error("Invalid date format:", error)
      }
    }
  }, [checkIn, months, years, bookingType])

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
  
  const incrementYears = () => {
    const newYears = years < 5 ? years + 1 : 5
    setYears(newYears)
    
    // Update checkout date when years change for yearly booking
    if (bookingType === "year" && checkIn) {
      try {
        const checkInDate = parseISO(checkIn)
        if (isValid(checkInDate)) {
          const checkOutDate = addMonths(checkInDate, newYears * 12)
          setCheckOut(format(checkOutDate, 'yyyy-MM-dd'))
        }
      } catch (error) {
        console.error("Error updating checkout date:", error)
      }
    }
  }
  
  const decrementYears = () => {
    if (years <= 1) return
    
    const newYears = years - 1
    setYears(newYears)
    
    // Update checkout date when years change for yearly booking
    if (bookingType === "year" && checkIn) {
      try {
        const checkInDate = parseISO(checkIn)
        if (isValid(checkInDate)) {
          const checkOutDate = addMonths(checkInDate, newYears * 12)
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
      setGuests((prev) => prev < 1 ? prev + 1 : 1);
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
      toast.error("Please enter a location")
      return
    }

    // Get current date/time for validation
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    
    // Validate check-in date
    if (!checkIn) {
      toast.error("Please select a check-in date")
      return
    }
    
    const checkInDate = parseISO(checkIn)
    if (isBefore(checkInDate, todayStart)) {
      toast.error("Check-in date cannot be in the past")
      setCheckIn(format(now, 'yyyy-MM-dd'))
      return
    }
    
    // Validate check-out date for daily/monthly bookings
    if ((bookingType === "day" || bookingType === "month") && checkOut) {
      const checkOutDate = parseISO(checkOut)
      if (isBefore(checkOutDate, checkInDate)) {
        toast.error("Check-out date cannot be before check-in date")
        setCheckOut(checkIn)
        return
      }
    }
    
    // Validate time for hourly bookings
    if (bookingType === "hour") {
      if (!checkInTime) {
        toast.error("Please select a check-in time")
        return
      }
      
      if (!checkOutTime) {
        toast.error("Please select a check-out time")
        return
      }
      
      // If booking is for today, validate check-in time is not in the past
      if (format(checkInDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
        const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number)
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()
        
        if (checkInHour < currentHour || (checkInHour === currentHour && checkInMinute < currentMinute)) {
          toast.error("Check-in time cannot be in the past")
          return
        }
      }
      
      // Validate checkout time is after checkin time on the same day
      if (checkIn === checkOut) {
        if (checkOutTime <= checkInTime) {
          toast.error("Check-out time must be after check-in time")
          return
        }
      }
    }

    const params = new URLSearchParams()
    params.set('location', location)
    params.set('propertyType', sectionType === "hotels" ? "hotel" : "hostel")
    
    // Set the booking type parameter based on property type
    if (sectionType === "hostels") {
      // Use monthly or yearly booking for hostels
      params.set('bookingType', bookingType === "month" ? "monthly" : "yearly")
    } else {
      // For hotels, use either daily or hourly
    params.set('bookingType', bookingType === "day" ? "daily" : "hourly")
    }

    // Set check-in date
    if (checkIn) params.set('checkInDate', checkIn)
    
    // Set check-out date based on booking type
    if (sectionType === "hostels") {
      // For hostels, always set checkout date (monthly or yearly booking)
      if (checkOut) params.set('checkOutDate', checkOut)
      // Set duration parameter for hostels
      if (bookingType === "month") {
        params.set('months', months.toString())
      } else if (bookingType === "year") {
        params.set('years', years.toString())
      }
      params.set('rooms', rooms.toString())
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
    
    // Validate that the new date is not in the past
    const selectedDate = parseISO(newDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    if (isBefore(selectedDate, currentDate)) {
      // Don't allow past dates
      setCheckIn(format(currentDate, 'yyyy-MM-dd'));
      return;
    }
    
    // If booking type is monthly or yearly, update checkout date based on duration
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
    } else if (bookingType === "year") {
      try {
        const checkInDate = parseISO(newDate)
        if (isValid(checkInDate)) {
          const checkOutDate = addMonths(checkInDate, years * 12)
          setCheckOut(format(checkOutDate, 'yyyy-MM-dd'))
        }
      } catch (error) {
        console.error("Error updating checkout date:", error)
      }
    } else {
      // For other booking types, ensure checkout is not before checkin
      if (checkOut && isBefore(parseISO(checkOut), parseISO(newDate))) {
        // If checkout is before the new checkin, set checkout to be the same as checkin
        setCheckOut(newDate)
      }
    }
  }

  // Update check-out date handler to validate it's after check-in
  const handleCheckOutChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    
    // Validate checkout is not before checkin
    if (checkIn && isBefore(parseISO(newDate), parseISO(checkIn))) {
      // If checkout is before checkin, set it to checkin
      setCheckOut(checkIn);
      return;
    }
    
    setCheckOut(newDate)
  }

  // Helper function to get current time constraints
  const getCurrentTimeConstraints = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // Format current time as HH:MM
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    
    // Calculate next hour time (rounded up)
    const nextHour = currentMinute > 0 ? currentHour + 1 : currentHour
    const nextHourTime = `${nextHour.toString().padStart(2, '0')}:00`
    
    // Calculate two hours later for default checkout
    const twoHoursLater = (nextHour + 2) % 24
    const twoHoursLaterTime = `${twoHoursLater.toString().padStart(2, '0')}:00`
    
    return {
      currentTime,
      nextHourTime,
      twoHoursLaterTime
    }
  }

  // Update check-in time handler with improved validation and toast notifications
  const handleCheckInTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckInTime = e.target.value
    
    // Get current date and selected check-in date
    const today = new Date()
    const checkInDate = checkIn ? parseISO(checkIn) : today
    const isCheckInToday = format(checkInDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    
    // If check-in is today, validate against current time
    if (isCheckInToday) {
      const now = new Date()
      const currentTimeString = format(now, 'HH:mm')
      
      if (newCheckInTime < currentTimeString) {
        toast.error("Check-in time cannot be earlier than the current time")
        
        // Calculate a valid check-in time (current time rounded to next 30 minutes)
        const currentMinute = now.getMinutes()
        const adjustedMinutes = currentMinute <= 30 ? 30 : 0
        const adjustedHours = currentMinute <= 30 ? now.getHours() : (now.getHours() + 1) % 24
        const adjustedCheckInTime = `${adjustedHours.toString().padStart(2, '0')}:${adjustedMinutes.toString().padStart(2, '0')}`
        
        setCheckInTime(adjustedCheckInTime)
        return
      }
    }
    
    // Set the new check-in time
    setCheckInTime(newCheckInTime)
    
    // If check-in and check-out are on same day, ensure check-out is after check-in
    if (checkIn === checkOut && newCheckInTime >= checkOutTime) {
      // Auto-adjust the check-out time to be 2 hours after check-in
      const [hours, minutes] = newCheckInTime.split(':').map(Number)
      const adjustedHours = (hours + 2) % 24
      const newCheckOutTime = `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      
      toast.info(`Check-out time automatically adjusted to ${newCheckOutTime}`)
      setCheckOutTime(newCheckOutTime)
    }
  }
  
  // Update check-out time handler with improved validation and toast notifications
  const handleCheckOutTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckOutTime = e.target.value
    
    // For hourly bookings, ensure proper validation
    if (bookingType === "hour") {
      // Get current date and time
      const now = new Date()
      const currentTimeString = format(now, 'HH:mm')
      
      // Check if the checkout date is today
      const checkOutDate = checkOut ? parseISO(checkOut) : now
      const isCheckOutToday = format(checkOutDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
      
      // If checkout is today, validate against current time
      if (isCheckOutToday) {
        if (newCheckOutTime < currentTimeString) {
          toast.error("Check-out time cannot be earlier than the current time")
          
          // Calculate a valid checkout time (current time + 1 hour)
          const adjustedHours = (now.getHours() + 1) % 24
          const adjustedCheckOutTime = `${adjustedHours.toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
          
          setCheckOutTime(adjustedCheckOutTime)
          return
        }
      }
      
      // For hourly bookings, checkin and checkout dates are always the same
      // So we need to ensure checkout time is after checkin time
      if (newCheckOutTime <= checkInTime) {
        toast.error("Check-out time must be after check-in time")
        
        // Calculate a valid checkout time (check-in + 2 hours)
        const [hours, minutes] = checkInTime.split(':').map(Number)
        const adjustedHours = (hours + 2) % 24
        const adjustedCheckOutTime = `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        
        setCheckOutTime(adjustedCheckOutTime)
        return
      }
    }
    
    // Set the new check-out time
    setCheckOutTime(newCheckOutTime)
  }

  // Handle booking type change with appropriate updates
  const handleBookingTypeChange = (type: "day" | "hour" | "month" | "year") => {
    // Restrict booking types based on section type
    if (sectionType === "hostels" && type !== "month" && type !== "year") {
      return; // Only allow "month" and "year" for hostels
    }
    if (sectionType === "hotels" && (type === "month" || type === "year")) {
      return; // Don't allow "month" or "year" for hotels
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
    } else if (type === "year" && checkIn) {
      // For yearly booking, set checkout based on years
      try {
        const checkInDate = parseISO(checkIn)
        if (isValid(checkInDate)) {
          const checkOutDate = addMonths(checkInDate, years * 12)
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
              <ul className="absolute z-20 w-full mt-10 bg-white border border-gray-300 rounded-md shadow-lg">
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
            <div className="relative cursor-pointer" onClick={() => checkInRef.current?.showPicker()}>
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
              <div className="relative cursor-pointer" onClick={() => checkInTimeRef.current?.showPicker()}>
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
              <div className="relative cursor-pointer" onClick={() => checkOutRef.current?.showPicker()}>
                  <input
                    id="check-out"
                    ref={checkOutRef}
                    type="date"
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                    value={checkOut}
                    min={minCheckOutDate}
                    onChange={handleCheckOutChange}
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
              <div className="relative cursor-pointer" onClick={() => checkOutTimeRef.current?.showPicker()}>
                  <input
                    id="check-out-time"
                    ref={checkOutTimeRef}
                    type="time"
                    className="outline-none text-sm w-full cursor-pointer"
                    value={checkOutTime}
                    min={checkIn === checkOut ? minCheckOutTime : undefined}
                    onChange={handleCheckOutTimeChange}
                  />
              </div>
            </div>
          </div>
        )}

        {/* Show Months field for hostels with monthly booking */}
        {sectionType === "hostels" && bookingType === "month" && (
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
              </div>
            </div>
          </div>
        )}

        {/* Show Years field for hostels with yearly booking */}
        {sectionType === "hostels" && bookingType === "year" && (
          <div className="flex items-center flex-1 min-w-full md:min-w-[90px] p-2 border-b md:border-b-0 md:border-r border-gray-200">
            <div className="flex flex-col flex-grow">
              <label className="text-xs text-gray-500 font-medium">Duration (Years)</label>
              <div className="flex items-center relative">
                <div className="flex items-center flex-grow">
                  <button
                    type="button"
                    className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                    onClick={decrementYears}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="mx-2 text-sm">{years}</span>
                  <button
                    type="button"
                    className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                    onClick={incrementYears}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show Rooms field for hotels */}
        {sectionType === "hotels" && (
            <div className="flex items-center flex-1 min-w-full md:min-w-[80px] p-2 border-b md:border-b-0 md:border-r border-gray-200 relative group">
              <div className="flex flex-col flex-grow">
                <label className="text-xs text-gray-500 font-medium">Rooms</label>
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
              
              {/* Tooltip */}
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black text-white text-xs p-2 rounded pointer-events-none -bottom-12 left-0 whitespace-nowrap z-20">
                Maximum 5 rooms, 3 guests per room
                <div className="absolute -top-1 left-4 transform rotate-45 w-2 h-2 bg-black"></div>
              </div>
            </div>
        )}

        {/* Guests */}
        <div className="flex items-center flex-1 min-w-full md:min-w-[80px] p-2 border-b md:border-b-0 md:border-r border-gray-200 relative group">
          <div className="flex flex-col flex-grow" >
            <label className={`text-xs transition-all duration-200 ${
              guests || isFocused
                ? "text-gray-500"
                : "text-gray-400"
            }`}>
              Guests 
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
                disabled={sectionType === "hotels" ? guests >= rooms * 3 : guests >= 10}
                aria-label="Increase guests"
              >
                <Plus size={14} />
              </button>
              </div>
            </div>
          </div>
          
          {/* Tooltip */}
          {sectionType === "hotels" && (
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black text-white text-xs p-2 rounded pointer-events-none -bottom-12 left-0 whitespace-nowrap z-20">
              Maximum 5 rooms, 3 guests per room
              <div className="absolute -top-1 left-4 transform rotate-45 w-2 h-2 bg-black"></div>
            </div>
          )}
          
          {sectionType === "hostels" && (
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black text-white text-xs p-2 rounded pointer-events-none -bottom-12 left-0 whitespace-nowrap z-20">
              Maximum 1 guest per room
            </div>
          )}
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
        
        {sectionType === "hostels" && (
          <div className="bg-white rounded-full p-1 inline-flex shadow-md">
            <button
              type="button"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                bookingType === "month" ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handleBookingTypeChange("month")}
            >
              Book by Month
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                bookingType === "year" ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handleBookingTypeChange("year")}
            >
              Book by Year
            </button>
          </div>
        )}
      </div>
    </>
  )
} 