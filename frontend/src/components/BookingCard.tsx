'use client'

import { useState, useEffect, useCallback } from "react"
import Link from 'next/link'
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Info, AlertCircle, CheckCircle2, CalendarDays } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Room } from '@/types/property'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { Princess_Sofia } from "next/font/google"
import { Separator } from "./ui/separator"
import { toast } from 'react-toastify'

interface Offer {
  id: number
  offer: {
    id: number
    title: string
    description: string
    discount_percentage: string
    code: string
    offer_start_date: string
    offer_end_date: string
    is_active: boolean
  }
}

interface BookingCardProps {
  bookingType: string | null
  property: any
  checkInDate: Date | undefined
  checkOutDate: Date | undefined
  checkInTime: string | null
  checkOutTime: string | null
  selectedRoomMap: Map<string, any>
  selectedGuests: number | null
  selectedRoomsCount: number | null
  months?: number
  years?: number
  searchParams: ReturnType<typeof useSearchParams>
}

// Create a wrapper for Calendar that handles auto-closing properly
function CalendarWithAutoClose({
  selected,
  onSelect,
  autoClose = true,
  ...props
}: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  autoClose?: boolean;
  [key: string]: any;
}) {
  const handleSelect = (date: Date | undefined) => {
    // Call the provided onSelect
    onSelect(date);

    // Auto-close the popover after selection only if autoClose is enabled
    if (date && autoClose) {
      setTimeout(() => {
        // Find and close the popover
        const openPopover = document.querySelector('[data-state="open"][data-radix-popper-content-wrapper]');
        if (openPopover) {
          const popoverTrigger = document.activeElement as HTMLElement;
          if (popoverTrigger && popoverTrigger.click) {
            popoverTrigger.click();
          }
        }
      }, 10);
    }
  };

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={handleSelect}
      {...props}
    />
  );
}

export function BookingCard({
  bookingType,
  property,
  checkInDate: initialCheckInDate,
  checkOutDate: initialCheckOutDate,
  checkInTime: initialCheckInTime,
  checkOutTime: initialCheckOutTime,
  selectedRoomMap,
  months: initialMonths = 1,
  years: initialYears = 1,
  selectedGuests: initialSelectedGuests,
  selectedRoomsCount: initialSelectedRoomsCount,
  searchParams
}: BookingCardProps) {
  const parseLocalDate = (dateStr: string | null) => {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const [date, setDate] = useState<Date | undefined>(
    parseLocalDate(searchParams.get('checkInDate')) || initialCheckInDate
  );
  const [checkOut, setCheckOutDate] = useState<Date | undefined>(
    parseLocalDate(searchParams.get('checkOutDate')) || initialCheckOutDate
  );

  // Extract hour from time strings (HH:MM format) or use defaults
  const extractHourFromTimeString = (timeString: string | null): string => {
    if (!timeString) return "12";
    try {
      const match = timeString.match(/^(\d{1,2}):/);
      return match ? match[1] : "12";
    } catch (error) {
      console.error("Time parsing error:", error);
      return "12";
    }
  };

  const [checkInTime, setCheckInTime] = useState<string>(
    extractHourFromTimeString(initialCheckInTime)
  );

  const [checkOutTime, setCheckOutTime] = useState<string>(
    extractHourFromTimeString(initialCheckOutTime) ||
    ((parseInt(extractHourFromTimeString(initialCheckInTime) || "12") + 2) % 24).toString()
  );

  const [guests, setGuests] = useState(initialSelectedGuests || 1)
  const [months, setMonths] = useState(initialMonths)
  const [years, setYears] = useState(initialYears)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [taxRate, setTaxRate] = useState<number>(0.18) // Default to 18% GST

  // Check if this is a hostel property
  const isHostel = property?.property_type === 'hostel'

  // Fetch tax rate from database
  useEffect(() => {
    const fetchTaxRate = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/'}property/settings/`)
        const settings = await response.json()
        if (settings.tax_rate) {
          setTaxRate(parseFloat(settings.tax_rate))
        }
      } catch (error) {
        console.error('Error fetching tax rate:', error)
        // Keep default value
      }
    }
    fetchTaxRate()
  }, [])

  // When selectedRoomMap changes, update the URL to match
  useEffect(() => {
    if (property && property.id) {
      // Save the current room selections to session storage
      const roomSelectionsObject: Record<string, number> = {};
      selectedRoomMap.forEach((room, id) => {
        if (room.quantity > 0) {
          roomSelectionsObject[id] = room.quantity || 0;
        }
      });

      // Only update if there are selections
      if (Object.keys(roomSelectionsObject).length > 0) {
        sessionStorage.setItem(`roomSelections_${property.id}`, JSON.stringify(roomSelectionsObject));
      }
    }
  }, [selectedRoomMap, property]);

  // Get today's date in YYYY-MM-DD format for date restrictions
  const today = new Date()
  const formattedToday = format(today, 'yyyy-MM-dd')
  const currentHour = today.getHours()

  // Get room count directly from search params instead of using state
  const getRoomCountFromSearchParams = useCallback(() => {
    const roomsParam = searchParams.get('rooms');
    // Use the total from selectedRoomMap as fallback
    if (!roomsParam) {
      const totalFromMap = Array.from(selectedRoomMap.values())
        .reduce((sum, room) => sum + (room.quantity || 0), 0);
      return totalFromMap > 0 ? totalFromMap : (initialSelectedRoomsCount || 1);
    }
    return parseInt(roomsParam, 10);
  }, [searchParams, selectedRoomMap, initialSelectedRoomsCount]);

  // Update guests in URL immediately on change
  const handleGuestsChange = useCallback((value: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('guests', value.toString());

    const url = new URL(window.location.href);
    url.search = newSearchParams.toString();
    window.history.pushState({}, '', url);

    setGuests(value);
  }, [searchParams]);

  // Sync rooms state with props when selectedRoomsCount changes
  useEffect(() => {
    // Don't update local state from initialSelectedRoomsCount anymore
    // Instead check if guests exceeds the maximum allowed (3 per room)
    const currentRooms = getRoomCountFromSearchParams();
    if (!isHostel && guests > currentRooms * 3) {
      // If guests exceeds maximum allowed, update it to the maximum
      const maxGuests = currentRooms * 3;
      handleGuestsChange(maxGuests);
    }
  }, [initialSelectedRoomsCount, isHostel, guests, handleGuestsChange, searchParams]);

  // Listen for changes in room selections from the property page
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `roomSelections_${property.id}` && e.newValue) {
        try {
          const savedSelections = JSON.parse(e.newValue);
          const totalRooms = Object.values(savedSelections).reduce((sum: number, quantity: any) => sum + (Number(quantity) || 0), 0);

          // Update search params directly without changing local state
          const currentRooms = getRoomCountFromSearchParams();
          if (totalRooms !== currentRooms) {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.set('rooms', totalRooms.toString());

            // If not a hostel, enforce the 3 guests per room rule
            if (!isHostel && guests > totalRooms * 3) {
              const maxGuests = totalRooms * 3;
              newSearchParams.set('guests', maxGuests.toString());
              handleGuestsChange(maxGuests);
            }

            const url = new URL(window.location.href);
            url.search = newSearchParams.toString();
            window.history.pushState({}, '', url);
          }
        } catch (err) {
          console.error("Error parsing room selections from storage:", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [property.id, searchParams, isHostel, guests, handleGuestsChange]);

  // Function to update rooms in URL and enforce guest limits
  const handleRoomsChange = useCallback((value: number) => {
    console.log("handleRoomsChange", value);
    // Only update the search params, not the local state
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('rooms', value.toString());

    // If not a hostel, enforce the 3 guests per room rule
    if (!isHostel && guests > value * 3) {
      const maxGuests = value * 3;
      handleGuestsChange(maxGuests);
    }

    const url = new URL(window.location.href);
    url.search = newSearchParams.toString();
    window.history.pushState({}, '', url);
  }, [searchParams, isHostel, guests, handleGuestsChange]);

  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Filter available hours based on current time when date is today
  const getAvailableHours = (forCheckout = false) => {
    if (!date) return hours

    const isToday = date && format(date, 'yyyy-MM-dd') === formattedToday

    if (isToday) {
      // If today, only show future hours (current hour + 1 and later)
      if (forCheckout && date && checkOut && date.toDateString() === checkOut.toDateString()) {
        // For checkout on the same day as checkin, ensure times are after checkin time
        const checkinHour = parseInt(checkInTime, 10)
        return hours.filter(hour => hour > currentHour && hour > checkinHour)
      }
      return hours.filter(hour => hour > currentHour)
    }

    // For checkout time, if it's the same day as checkin, only show hours after checkin time
    if (forCheckout && date && checkOut && date.toDateString() === checkOut.toDateString()) {
      const checkinHour = parseInt(checkInTime, 10)
      return hours.filter(hour => hour > checkinHour)
    }

    return hours
  }

  const formatTime = (hour: number | string) => {
    try {
      const hourNum = typeof hour === 'string' ? parseInt(hour, 10) : hour;
      if (isNaN(hourNum)) return "12:00 PM"; // Default if parsing fails

      return hourNum === 0 ? "12:00 AM" :
        hourNum < 12 ? `${hourNum}:00 AM` :
          hourNum === 12 ? "12:00 PM" :
            `${hourNum - 12}:00 PM`;
    } catch (error) {
      console.error("Time formatting error:", error);
      return "12:00 PM"; // Fallback
    }
  }

  // Set default times if booking is for today and current time options aren't valid
  useEffect(() => {
    if (date && format(date, 'yyyy-MM-dd') === formattedToday) {
      // If selected time is before or equal to current time, update it
      const selectedCheckInHour = parseInt(checkInTime, 10)

      if (selectedCheckInHour <= currentHour) {
        // Set check-in time to next hour
        const nextHour = currentHour + 1
        setCheckInTime(nextHour.toString())

        // Also update checkout time to be at least 2 hours after checkin
        const newCheckoutHour = (nextHour + 2) % 24
        setCheckOutTime(newCheckoutHour.toString())
      }
    }
  }, [date, currentHour, formattedToday, checkInTime])

  // Enforce checkout date is after checkin date
  useEffect(() => {
    if (date && checkOut) {
      const checkinDate = new Date(date)
      const checkoutDate = new Date(checkOut)

      if (checkoutDate < checkinDate) {
        // If checkout is before checkin, set checkout to checkin
        setCheckOutDate(date)
      }
    }
  }, [date, checkOut])

  // Enforce checkout time is after checkin time on the same day
  useEffect(() => {
    if (date && checkOut && date.toDateString() === checkOut.toDateString() &&
      checkInTime && checkOutTime && parseInt(checkOutTime) <= parseInt(checkInTime)) {
      // If checkout time is before or equal to checkin time on the same day
      const newCheckoutTime = (parseInt(checkInTime) + 2) % 24
      setCheckOutTime(String(newCheckoutTime))
    }
  }, [date, checkOut, checkInTime, checkOutTime])

  // Update checkout date when check-in date or months/years change for long-term bookings
  useEffect(() => {
    if (bookingType === 'monthly' && date) {
      const newCheckoutDate = new Date(date);
      newCheckoutDate.setMonth(newCheckoutDate.getMonth() + months);
      setCheckOutDate(newCheckoutDate);

      // Update search params with the new checkout date
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('checkOutDate', format(newCheckoutDate, 'yyyy-MM-dd'));

      // Update URL without page reload
      const url = new URL(window.location.href);
      url.search = newSearchParams.toString();
      window.history.pushState({}, '', url);
    } else if (bookingType === 'yearly' && date) {
      const newCheckoutDate = new Date(date);
      newCheckoutDate.setMonth(newCheckoutDate.getMonth() + (years * 12));
      setCheckOutDate(newCheckoutDate);

      // Update search params with the new checkout date
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('checkOutDate', format(newCheckoutDate, 'yyyy-MM-dd'));

      // Update URL without page reload
      const url = new URL(window.location.href);
      url.search = newSearchParams.toString();
      window.history.pushState({}, '', url);
    }
  }, [date, months, years, bookingType, searchParams]);

  // Debug logs to help troubleshoot time values
  useEffect(() => {
    console.log("BookingCard received times:", {
      initialCheckInTime,
      initialCheckOutTime,
      parsedCheckInTime: checkInTime,
      parsedCheckOutTime: checkOutTime,
      bookingType
    });
  }, [initialCheckInTime, initialCheckOutTime, checkInTime, checkOutTime, bookingType]);

  const calculatePrice = () => {
    // If no rooms are selected, return 0
    if (!selectedRoomMap || selectedRoomMap.size === 0) return 0;

    // Get only rooms with quantity > 0
    const selectedRooms = Array.from(selectedRoomMap.values()).filter(room => room.quantity > 0);
    if (selectedRooms.length === 0) return 0;

    // Calculate price for each selected room type
    let totalPrice = 0;

    for (const room of selectedRooms) {
      const quantity = room.quantity || 0;
      if (quantity <= 0) continue;

      let roomPrice = 0;

      // Check if we should use monthly or yearly rate
      if (bookingType === 'monthly' || (isHostel && room.monthly_rate && parseFloat(room.monthly_rate) > 0)) {
        // Use monthly rate for monthly bookings or hostels
        const basePrice = parseFloat(room.monthly_rate || '0');
        roomPrice = basePrice * quantity;
      } else if (bookingType === 'yearly' && room.yearly_rate && parseFloat(room.yearly_rate) > 0) {
        // Use yearly rate for yearly bookings
        const basePrice = parseFloat(room.yearly_rate || '0');
        roomPrice = basePrice * quantity;
      } else {
        // Use hourly or daily rate based on bookingType
        const basePrice = bookingType === 'hourly'
          ? parseFloat(room.hourly_rate || '0')
          : parseFloat(room.daily_rate || '0');

        let duration = 0;

        if (bookingType === 'hourly' && checkInTime && checkOutTime && date) {
          const startTime = new Date(date);
          const endTime = new Date(date);
          startTime.setHours(parseInt(checkInTime, 10), 0, 0, 0);
          endTime.setHours(parseInt(checkOutTime, 10), 0, 0, 0);
          duration = (endTime.getTime() - startTime.getTime()) / (1000 * 3600);

          // If end time is earlier than start time, assume it's the next day
          if (duration <= 0) {
            duration += 24;
          }
        } else if (date && checkOut) {
          duration = Math.max(1, (checkOut.getTime() - date.getTime()) / (1000 * 3600 * 24));
        } else {
          // Default to 1 day/hour if we don't have complete date information
          duration = 1;
        }

        console.log("duration", duration, basePrice, quantity, bookingType)

        roomPrice = basePrice * duration * quantity;
      }

      totalPrice += roomPrice;
    }

    return totalPrice;
  }

  const totalPrice = calculatePrice()

  // Calculate average discount from all selected rooms
  const calculateAverageDiscount = () => {
    const selectedRooms = Array.from(selectedRoomMap.values()).filter(room => room.quantity > 0);
    if (selectedRooms.length === 0) return 0;

    const totalQuantity = selectedRooms.reduce((sum, room) => sum + (room.quantity || 0), 0);
    if (totalQuantity === 0) return 0;

    const weightedDiscount = selectedRooms.reduce((sum, room) => {
      const discount = room.discount ? parseFloat(String(room.discount)) : 0;
      return sum + (discount * (room.quantity || 0));
    }, 0);

    return weightedDiscount / totalQuantity;
  };

  const averageDiscount = calculateAverageDiscount();
  const hourlyDiscountPrice = () => {
    const selectedRooms = Array.from(selectedRoomMap.values()).filter(room => room.quantity > 0);
    if (selectedRooms.length === 0) return 0;

    let totalPrice = 0;

    for (const room of selectedRooms) {
      const discount = room.discount ? parseFloat(String(room.discount)) : 0;
      totalPrice += room.hourly_rate - (room.hourly_rate * discount / 100);
    }

    return totalPrice;
  }


  const discountedPrice = totalPrice - (totalPrice * averageDiscount / 100)
  const taxes = discountedPrice * taxRate // Tax rate from database

  // Safely handle offer discount
  const offerDiscount = selectedOffer ? (totalPrice * parseFloat(selectedOffer.offer.discount_percentage)) / 100 : 0
  const finalPrice = discountedPrice - offerDiscount + taxes

  // Determine the price label based on property type and room
  const getPriceLabel = () => {
    const selectedRoomsArray = Array.from(selectedRoomMap.values()).filter(room => room.quantity > 0);

    if (bookingType === 'yearly' && selectedRoomsArray.length > 0 && selectedRoomsArray[0].yearly_rate && parseFloat(selectedRoomsArray[0].yearly_rate || '0') > 0) {
      return "/year";
    } else if (bookingType === 'monthly' || (isHostel && selectedRoomsArray.length > 0 && selectedRoomsArray[0].monthly_rate && parseFloat(selectedRoomsArray[0].monthly_rate || '0') > 0)) {
      return "/month";
    } else {
      return bookingType === 'hourly' ? "/hour" : "/night";
    }
  };

  // Debug booking information
  useEffect(() => {
    const selectedRoomsArray = Array.from(selectedRoomMap.values()).filter(room => room.quantity > 0);

    console.log("BookingCard info:", {
      bookingType,
      isHostel,
      hasMonthlyRate: selectedRoomsArray.length > 0 && selectedRoomsArray[0].monthly_rate && parseFloat(selectedRoomsArray[0].monthly_rate || '0') > 0,
      hasYearlyRate: selectedRoomsArray.length > 0 && selectedRoomsArray[0].yearly_rate && parseFloat(selectedRoomsArray[0].yearly_rate || '0') > 0,
      checkIn: date,
      checkOut,
      months,
      years,
      rooms: getRoomCountFromSearchParams(),
      priceLabel: getPriceLabel(),
      calculatedPrice: totalPrice
    });
  }, [bookingType, isHostel, selectedRoomMap, date, checkOut, months, getRoomCountFromSearchParams, totalPrice]);

  // Add a function to update the URL search parameters for dates and times
  const updateDateTimeSearchParams = useCallback(() => {
    if (typeof window === 'undefined') return;

    const newSearchParams = new URLSearchParams(searchParams.toString());

    // Update date parameters
    if (date) {
      newSearchParams.set('checkInDate', format(date, 'yyyy-MM-dd'));
    }

    if (checkOut) {
      newSearchParams.set('checkOutDate', format(checkOut, 'yyyy-MM-dd'));
    }

    // Update time parameters for hourly bookings
    if (bookingType === 'hourly') {
      if (checkInTime) {
        newSearchParams.set('checkInTime', `${checkInTime}:00`);
      }

      if (checkOutTime) {
        newSearchParams.set('checkOutTime', `${checkOutTime}:00`);
      }
    }

    // Update URL without page reload
    const url = new URL(window.location.href);
    url.search = newSearchParams.toString();
    window.history.pushState({}, '', url);
  }, [date, checkOut, checkInTime, checkOutTime, bookingType, searchParams]);

  // Function to close popover
  const closePopover = useCallback(() => {
    // Find all open popovers and close them
    document.querySelectorAll('[data-state="open"]').forEach(popover => {
      const button = popover.querySelector('button[aria-expanded="true"]');
      if (button) {
        (button as HTMLElement).click();
      }
    });
  }, []);

  // Update URL search params immediately using the selected date
  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;

    // Update search params with selected date immediately
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('checkInDate', format(newDate, 'yyyy-MM-dd'));

    // Update URL before state change
    const url = new URL(window.location.href);
    url.search = newSearchParams.toString();
    window.history.pushState({}, '', url);

    // Now update state
    setDate(newDate);

    // Close the popover
    closePopover();
  };

  const handleCheckOutDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;

    // Update search params with selected date immediately
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('checkOutDate', format(newDate, 'yyyy-MM-dd'));

    // Update URL before state change
    const url = new URL(window.location.href);
    url.search = newSearchParams.toString();
    window.history.pushState({}, '', url);

    // Now update state
    setCheckOutDate(newDate);

    // Close the popover
    closePopover();
  };

  return (
    <Card className="w-full bg-white shadow-lg border-none">
      <CardHeader>
        {/* <div className="flex justify-between items-start">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">₹{bookingType === 'hourly' ? Math.round(hourlyDiscountPrice()) : Math.round(discountedPrice)}</span> */}
        {/* <span className="text-sm text-gray-500">{getPriceLabel()}</span> */}
        {/* {averageDiscount > 0 && (
                <>
                  <span className="text-gray-500 line-through">
                    ₹{Math.round(totalPrice)}
                  </span>
                  <Badge variant="secondary" className="bg-green-50 text-green-600 hover:bg-green-50 hover:text-green-600">
                    {averageDiscount.toFixed(0)}% off
                  </Badge>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500">+ ₹{Math.round(taxes)} taxes & fees</p>
          </div>
        </div> */}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Redesigned Date/Time/Room/Guest/Months Layout */}
        <div className="space-y-4">
          {/* Hotel Daily Booking: Check-in and Check-out date in 1 row, Rooms and Guests in 1 row */}
          {bookingType === 'daily' && !isHostel && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="neutral" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}> <CalendarDays className="mr-2 h-4 w-4" /> {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>} </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarWithAutoClose selected={date} onSelect={handleDateChange} initialFocus disabled={(date: Date) => date < new Date(formattedToday)} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Check-out Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="neutral" className={cn("w-full justify-start text-left font-normal", !checkOut && "text-muted-foreground")}> <CalendarDays className="mr-2 h-4 w-4" /> {checkOut ? format(checkOut, "MMM d, yyyy") : <span>Pick a date</span>} </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarWithAutoClose selected={checkOut} onSelect={handleCheckOutDateChange} initialFocus disabled={(calDate: Date) => { if (!date) return calDate < new Date(formattedToday); return calDate < new Date(formattedToday) || calDate < date; }} defaultMonth={date && date > new Date() ? date : undefined} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Number of Rooms</Label>
                  <Input type="number" value={getRoomCountFromSearchParams()} onChange={(e) => handleRoomsChange(parseInt(e.target.value) || 1)} min={1} className="mt-1 bg-gray-100" disabled />
                </div>
                <div>
                  <Label>Number of Guests</Label>
                  <Input type="number" value={guests} onChange={(e) => { const newValue = parseInt(e.target.value) || 1; const maxGuests = getRoomCountFromSearchParams() * 3; handleGuestsChange(Math.min(newValue, maxGuests)); }} min={1} max={getRoomCountFromSearchParams() * 3} className="mt-1" />
                  <div className="text-xs text-gray-500 mt-1">Max 3 guests per room</div>
                </div>
              </div>
            </>
          )}

          {/* Hotel Hourly Booking: Check-in date in 1 row, check-in/out time in 1 row, Rooms and Guests in 1 row */}
          {bookingType === 'hourly' && !isHostel && (
            <>
              <div>
                <Label>Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="neutral" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}> <CalendarDays className="mr-2 h-4 w-4" /> {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>} </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarWithAutoClose selected={date} onSelect={handleDateChange} initialFocus disabled={(date: Date) => date < new Date(formattedToday)} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Check-in Time</Label>
                  <Select value={checkInTime} onValueChange={(newValue) => { /* ...existing code... */ }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time">{formatTime(parseInt(checkInTime))}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>{getAvailableHours().map((hour) => (<SelectItem key={hour} value={hour.toString()}>{formatTime(hour)}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Check-out Time</Label>
                  <Select value={checkOutTime} onValueChange={(newValue) => { /* ...existing code... */ }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time">{formatTime(parseInt(checkOutTime))}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>{getAvailableHours(true).map((hour) => (<SelectItem key={hour} value={hour.toString()}>{formatTime(hour)}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Number of Rooms</Label>
                  <Input type="number" value={getRoomCountFromSearchParams()} onChange={(e) => handleRoomsChange(parseInt(e.target.value) || 1)} min={1} className="mt-1 bg-gray-100" disabled />
                </div>
                <div>
                  <Label>Number of Guests</Label>
                  <Input type="number" value={guests} onChange={(e) => { const newValue = parseInt(e.target.value) || 1; const maxGuests = getRoomCountFromSearchParams() * 3; handleGuestsChange(Math.min(newValue, maxGuests)); }} min={1} max={getRoomCountFromSearchParams() * 3} className="mt-1" />
                  <div className="text-xs text-gray-500 mt-1">Max 3 guests per room</div>
                </div>
              </div>
            </>
          )}

          {/* Hostel Monthly/Yearly: Check-in and Check-out date in 1 row, rooms/guests/months in 1 row */}
          {(isHostel && (bookingType === 'monthly' || bookingType === 'yearly')) && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="neutral" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}> <CalendarDays className="mr-2 h-4 w-4" /> {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>} </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarWithAutoClose selected={date} onSelect={handleDateChange} initialFocus disabled={(date: Date) => date < new Date(formattedToday)} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Check-out Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="neutral" className={cn("w-full justify-start text-left font-normal", !checkOut && "text-muted-foreground")}> <CalendarDays className="mr-2 h-4 w-4" /> {checkOut ? format(checkOut, "MMM d, yyyy") : <span>Pick a date</span>} </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarWithAutoClose selected={checkOut} onSelect={handleCheckOutDateChange} initialFocus disabled={(calDate: Date) => { if (!date) return calDate < new Date(formattedToday); return calDate < new Date(formattedToday) || calDate < date; }} defaultMonth={date && date > new Date() ? date : undefined} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Number of Rooms</Label>
                  <Input type="number" value={getRoomCountFromSearchParams()} onChange={(e) => handleRoomsChange(parseInt(e.target.value) || 1)} min={1} className="mt-1 bg-gray-100" disabled />
                </div>
                <div>
                  <Label>Number of Guests</Label>
                  <Input type="number" value={guests} onChange={(e) => { const newValue = parseInt(e.target.value) || 1; const maxGuests = getRoomCountFromSearchParams() * 1; handleGuestsChange(Math.min(newValue, maxGuests)); }} min={1} max={getRoomCountFromSearchParams() * 1} className="mt-1" />
                  <div className="text-xs text-gray-500 mt-1">Max 1 guest per room</div>
                </div>
                <div>
                  <Label>{bookingType === 'monthly' ? 'Number of Months' : 'Number of Years'}</Label>
                  <Input type="number" value={bookingType === 'monthly' ? months : years} onChange={(e) => { const newValue = parseInt(e.target.value) || 1; if (bookingType === 'monthly') { setMonths(newValue); } else { setYears(newValue); } }} min={1} max={bookingType === 'monthly' ? 12 : 5} className="mt-1" />
                </div>
              </div>
            </>
          )}

          {/* Fallback: original layout for other cases */}
          {/* ...existing code for other cases... */}
        </div>

        {/* Room Selection */}
        {Array.from(selectedRoomMap.values()).filter(room => room.quantity > 0).length > 0 ? (
          <div className="space-y-2">
            <Label>Selected Rooms</Label>
            {Array.from(selectedRoomMap.values())
              .filter(room => room.quantity > 0)
              .map(room => (
                <div key={room.id} className="shadow-lg rounded-xl p-3 flex justify-between items-center bg-white">
                  <div>
                    <span className="font-medium">{room.name}</span>
                    <p className="text-sm text-gray-500">
                      {bookingType === 'yearly'
                        ? `₹${room.yearly_rate || 'N/A'}/year`
                        : bookingType === 'monthly'
                          ? `₹${room.monthly_rate || 'N/A'}/month`
                          : bookingType === 'hourly'
                            ? `₹${room.hourly_rate || 'N/A'}/hour`
                            : `₹${room.daily_rate || 'N/A'}/night`
                      }
                    </p>
                  </div>
                  <Badge variant="outline">
                    Qty: {room.quantity}
                  </Badge>
                </div>
              ))
            }
          </div>
        ) : (
          <div className="shadow-lg rounded-xl p-4 text-center text-gray-500 bg-white">
            No rooms selected
          </div>
        )}

        {/* Coupon Section */}
        <div className="space-y-2">
          <Label>Apply Offer</Label>
          {selectedOffer ? (
            <div className="flex items-center justify-between p-2 shadow-lg rounded-xl bg-white">
              <div>
                <p className="font-medium">{selectedOffer.offer.code}</p>
                <p className="text-sm text-gray-500">{selectedOffer.offer.title}</p>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => setSelectedOffer(null)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          ) : property.offers && property.offers.length > 0 ? (
            <Select onValueChange={(value) => {
              const offer = property.offers.find((o: any) => o.offer.code === value);
              setSelectedOffer(offer || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select an offer" />
              </SelectTrigger>
              <SelectContent>
                {property.offers.map((offer: Offer) => (
                  <SelectItem key={offer.id} value={offer.offer.code}>
                    <div className="flex justify-between items-center">
                      <span>{offer.offer.code}</span>
                      <span className="text-green-600">-{offer.offer.discount_percentage}%</span>
                    </div>
                    <p className="text-sm text-gray-500">{offer.offer.title}</p>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-2 shadow-lg rounded-xl text-gray-500 bg-white">
              No offers available
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 pt-4 border-t">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Room Charges</span>
              <span>₹{bookingType === 'monthly'
                ? (totalPrice * months * guests).toFixed(2)
                : bookingType === 'yearly'
                  ? (totalPrice * years * guests).toFixed(2)
                  : totalPrice.toFixed(2)}</span>
            </div>
            {averageDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{bookingType === 'monthly'
                  ? (totalPrice * averageDiscount / 100 * months * guests).toFixed(2)
                  : bookingType === 'yearly'
                    ? (totalPrice * averageDiscount / 100 * years * guests).toFixed(2)
                    : (totalPrice * averageDiscount / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Taxes ({(taxRate * 100).toFixed(0)}%)</span>
              <span>₹{bookingType === 'monthly'
                ? (taxes * months * guests).toFixed(2)
                : bookingType === 'yearly'
                  ? (taxes * years * guests).toFixed(2)
                  : taxes.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total Price</span>
              <span>₹{bookingType === 'monthly'
                ? (finalPrice * months * guests).toFixed(2)
                : bookingType === 'yearly'
                  ? (finalPrice * years * guests).toFixed(2)
                  : finalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        {isHostel ? (
          <>
            {/* Hostel: Show both Book Visit and Book Now side by side */}
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/property/${property.id}/visit`}>
                <Button
                  className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white"
                >
                  Schedule Visit
                </Button>
              </Link>
              <Link href={{
                pathname: `/property/${property.id}/book`,
                query: {
                  ...(searchParams ? Object.fromEntries(searchParams.entries()) : {}),
                  selectedRooms: JSON.stringify(
                    Array.from(selectedRoomMap.entries())
                      .filter(([_, room]) => room.quantity > 0)
                      .map(([id, room]) => ({
                        id,
                        name: room.name || room.occupancyType || 'Room',
                        quantity: room.quantity,
                        price: bookingType === 'yearly'
                          ? room.yearly_rate
                          : bookingType === 'monthly'
                            ? room.monthly_rate
                            : bookingType === 'hourly'
                              ? room.hourly_rate
                              : room.daily_rate
                      }))
                  ),
                  selectedOffer: selectedOffer ? JSON.stringify({
                    id: selectedOffer.id,
                    code: selectedOffer.offer.code,
                    title: selectedOffer.offer.title,
                    discount_percentage: selectedOffer.offer.discount_percentage
                  }) : ''
                }
              }}
                rel="noopener noreferrer">
                <Button
                  className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white"
                  disabled={Array.from(selectedRoomMap.values()).filter(room => room.quantity > 0).length === 0}
                >
                  Request Booking
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <Link href={{
            pathname: `/property/${property.id}/book`,
            query: {
              ...(searchParams ? Object.fromEntries(searchParams.entries()) : {}),
              selectedRooms: JSON.stringify(
                Array.from(selectedRoomMap.entries())
                  .filter(([_, room]) => room.quantity > 0)
                  .map(([id, room]) => ({
                    id,
                    name: room.name || room.occupancyType || 'Room',
                    quantity: room.quantity,
                    price: bookingType === 'yearly'
                      ? room.yearly_rate
                      : bookingType === 'monthly'
                        ? room.monthly_rate
                        : bookingType === 'hourly'
                          ? room.hourly_rate
                          : room.daily_rate
                  }))
              ),
              selectedOffer: selectedOffer ? JSON.stringify({
                id: selectedOffer.id,
                code: selectedOffer.offer.code,
                title: selectedOffer.offer.title,
                discount_percentage: selectedOffer.offer.discount_percentage
              }) : ''
            }
          }}
            rel="noopener noreferrer">
            <Button
              className="w-full bg-[#B11E43] hover:bg-[#8f1836]"
              disabled={Array.from(selectedRoomMap.values()).filter(room => room.quantity > 0).length === 0}
            >
              Book Now
            </Button>
          </Link>
        )}

        <div className="w-full space-y-2">
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            10 people booked this property today
          </p>
        </div>
      </CardFooter>


    </Card>
  )
}

