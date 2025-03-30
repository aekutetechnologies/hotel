'use client'

import { useState, useEffect } from "react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Info, AlertCircle, CheckCircle2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Room } from '@/types/property'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { Princess_Sofia } from "next/font/google"

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
  selectedRoom: Room | null
  selectedGuests: number | null
  selectedRooms: number | null
  searchParams: ReturnType<typeof useSearchParams>
}

export function BookingCard({
  bookingType, 
  property, 
  checkInDate: initialCheckInDate, 
  checkOutDate: initialCheckOutDate,
  checkInTime: initialCheckInTime,
  checkOutTime: initialCheckOutTime,
  selectedRoom: initialSelectedRoom,
  selectedGuests: initialSelectedGuests,
  selectedRooms: initialSelectedRooms,
  searchParams
}: BookingCardProps) {
  const [date, setDate] = useState<Date | undefined>(initialCheckInDate)
  const [checkOut, setCheckOutDate] = useState<Date | undefined>(initialCheckOutDate)
  
  // Extract hour from time strings (HH:MM format) or use defaults
  const extractHourFromTimeString = (timeString: string | null): string => {
    if (!timeString) return "12";
    const match = timeString.match(/^(\d{1,2}):/);
    return match ? match[1] : "12";
  };
  
  const [checkInTime, setCheckInTime] = useState<string>(
    extractHourFromTimeString(initialCheckInTime)
  );
  
  const [checkOutTime, setCheckOutTime] = useState<string>(
    extractHourFromTimeString(initialCheckOutTime) || 
    ((parseInt(extractHourFromTimeString(initialCheckInTime) || "12") + 2) % 24).toString()
  );
  
  const [guests, setGuests] = useState(initialSelectedGuests|| 1)
  const [rooms, setRooms] = useState(initialSelectedRooms|| 1)
  const [months, setMonths] = useState(1)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  
  // Check if this is a hostel property
  const isHostel = property?.property_type === 'hostel'

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const formatTime = (hour: number) => {
    return hour === 0 ? "12:00 AM" : hour < 12 ? `${hour}:00 AM` : hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`
  }

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

  // Update checkout date when check-in date or months change for monthly bookings
  useEffect(() => {
    if (bookingType === 'monthly' && date) {
      const newCheckoutDate = new Date(date);
      newCheckoutDate.setMonth(newCheckoutDate.getMonth() + months);
      setCheckOutDate(newCheckoutDate);
    }
  }, [date, months, bookingType]);

  const calculatePrice = () => {
    if (!initialSelectedRoom) return 0

    const room = initialSelectedRoom
    
    // Check if we should use monthly rate
    let basePrice = 0
    
    if (bookingType === 'monthly' || (isHostel && room.monthly_rate && parseFloat(room.monthly_rate) > 0)) {
      // Use monthly rate for monthly bookings or hostels
      basePrice = parseFloat(room.monthly_rate || '0')
      
      // For monthly booking, use the months state variable
      let numberOfMonths = months;
      
      // If using monthly booking type but months is not set, calculate from dates as fallback
      if (bookingType === 'monthly' && (!numberOfMonths || numberOfMonths < 1)) {
        numberOfMonths = 1;
        
        // If we have dates, calculate the difference in months
        if (date && checkOut) {
          const diffTime = checkOut.getTime() - date.getTime();
          const diffDays = diffTime / (1000 * 3600 * 24);
          numberOfMonths = Math.ceil(diffDays / 30); // Approximate month calculation
        }
      }
      
      return basePrice * rooms * numberOfMonths;
    } else {
      // Use hourly or daily rate based on bookingType
      basePrice = bookingType === 'hourly'
        ? parseFloat(room.hourly_rate || '0')
        : parseFloat(room.daily_rate || '0')
      
      let duration = 0

      if (bookingType === 'hourly' && checkInTime && checkOutTime && date) {
        const startTime = new Date(date)
        const endTime = new Date(date)
        startTime.setHours(parseInt(checkInTime, 10), 0, 0, 0)
        endTime.setHours(parseInt(checkOutTime, 10), 0, 0, 0)
        duration = (endTime.getTime() - startTime.getTime()) / (1000 * 3600)
        
        // If end time is earlier than start time, assume it's the next day
        if (duration <= 0) {
          duration += 24;
        }
      } else if (date && checkOut) {
        duration = Math.max(1, (checkOut.getTime() - date.getTime()) / (1000 * 3600 * 24))
      } else {
        // Default to 1 day/hour if we don't have complete date information
        duration = 1;
      }

      return basePrice * duration * rooms
    }
  }

  const totalPrice = calculatePrice()
  const taxes = totalPrice * 0.18 // 18% GST
  
  // Safely handle discount as string or number
  const discountValue = initialSelectedRoom?.discount ? parseFloat(String(initialSelectedRoom.discount)) : 0
  const discountedPrice = totalPrice - (totalPrice * discountValue / 100)
  
  // Safely handle offer discount
  const offerDiscount = selectedOffer ? (totalPrice * parseFloat(selectedOffer.offer.discount_percentage)) / 100 : 0
  const finalPrice = discountedPrice - offerDiscount + taxes
  
  // Determine the price label based on property type and room
  const getPriceLabel = () => {
    if (bookingType === 'monthly' || (isHostel && initialSelectedRoom?.monthly_rate && parseFloat(initialSelectedRoom.monthly_rate || '0') > 0)) {
      return "/month";
    } else {
      return bookingType === 'hourly' ? "/hour" : "/night";
    }
  };
  
  // Debug booking information
  useEffect(() => {
    console.log("BookingCard info:", {
      bookingType,
      isHostel,
      hasMonthlyRate: initialSelectedRoom?.monthly_rate && parseFloat(initialSelectedRoom.monthly_rate || '0') > 0,
      checkIn: date,
      checkOut,
      months,
      rooms,
      priceLabel: getPriceLabel(),
      calculatedPrice: totalPrice
    });
  }, [bookingType, isHostel, initialSelectedRoom, date, checkOut, months, rooms, totalPrice]);

  return (
    <Card className="w-[380px] bg-white shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">₹{Math.round(discountedPrice)}</span>
              <span className="text-sm text-gray-500">{getPriceLabel()}</span>
              {initialSelectedRoom && initialSelectedRoom.discount && parseFloat(String(initialSelectedRoom.discount)) > 0 && (
                <>
                  <span className="text-gray-500 line-through">
                    ₹{Math.round(totalPrice)}
                  </span>
                  <Badge variant="secondary" className="bg-red-50 text-red-600">
                    {initialSelectedRoom.discount}% off
                  </Badge>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500">+ ₹{Math.round(taxes)} taxes & fees</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Date/Time Selection */}
        <div className="space-y-4">
          <div>
            <Label>Check-in Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {bookingType === 'hourly' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Check-in Time</Label>
                <Select value={checkInTime} onValueChange={setCheckInTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time">
                      {formatTime(parseInt(checkInTime))}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {formatTime(hour)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Check-out Time</Label>
                <Select value={checkOutTime} onValueChange={setCheckOutTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time">
                      {formatTime(parseInt(checkOutTime))}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {formatTime(hour)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : bookingType !== 'monthly' ? (
            <div>
              <Label>Check-out Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="default"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOutDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div>
              <Label>Auto Check-out Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="default"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOutDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) /* Don't show checkout date for monthly bookings */}


          
          <div className="grid grid-cols-2 gap-4">            
              <>
                <div>
                  <Label>Number of Rooms</Label>
                  <Input 
                    type="number" 
                    value={rooms}
                    onChange={(e) => setRooms(parseInt(e.target.value) || 1)}
                    min={1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Number of Guests</Label>
                  <Input 
                    type="number" 
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    min={1}
                    className="mt-1"
                  />
                </div>
              </>
          </div>
        </div>

        {/* Room Selection */}
        {initialSelectedRoom && (
          <div className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <span className="font-medium">
                {initialSelectedRoom.name}
              </span>
              <p className="text-sm text-gray-500">
                {bookingType === 'monthly' 
                  ? `₹${initialSelectedRoom.monthly_rate || 'N/A'}/month`
                  : bookingType === 'hourly' 
                    ? `₹${initialSelectedRoom.hourly_rate || 'N/A'}/hour`
                    : `₹${initialSelectedRoom.daily_rate || 'N/A'}/night`
                }
              </p>
            </div>
          </div>
        )}

        {/* Coupon Section */}
        <div className="space-y-2">
          <Label>Apply Offer</Label>
          {selectedOffer ? (
            <div className="flex items-center justify-between p-2 border rounded-md">
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
            <div className="p-2 border rounded-md text-gray-500">
              No offers available
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span>Room charges</span>
            <span>₹{Math.round(totalPrice)}</span>
          </div>
          {selectedOffer && (
            <div className="flex justify-between text-sm text-green-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{selectedOffer.offer.code} applied</span>
              </div>
              <span>-₹{Math.round(offerDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Taxes & fees</span>
            <span>₹{Math.round(taxes)}</span>
          </div>
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total</span>
            <span>₹{Math.round(finalPrice)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Link href={{
          pathname: `/property/${property.id}/book`,
          query: searchParams? Object.fromEntries(searchParams.entries()) : {}
        }}
        target="_blank"
        rel="noopener noreferrer">
          <Button className="w-full bg-[#B11E43] hover:bg-[#8f1836]">
          Book Now
        </Button>
        </Link>
        
        <div className="w-full space-y-2">
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            10 people booked this property today
          </p>
          <button className="text-sm text-[#B11E43] flex items-center gap-1">
            Cancellation Policy <Info className="h-4 w-4" />
          </button>
        </div>
      </CardFooter>
    </Card>
  )
}

