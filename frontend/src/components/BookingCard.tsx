'use client'

import { useState } from "react"
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
import { HotelRoom, HostelRoom } from '@/types/property'
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
  selectedRoom: HotelRoom | HostelRoom | null
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
  const [checkInTime, setCheckInTime] = useState<string>(initialCheckInTime || "12")
  const [checkOutTime, setCheckOutTime] = useState<string>(initialCheckOutTime || "14")
  const [guests, setGuests] = useState(initialSelectedGuests|| 1)
  const [rooms, setRooms] = useState(initialSelectedRooms|| 1)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const formatTime = (hour: number) => {
    return hour === 0 ? "12:00 AM" : hour < 12 ? `${hour}:00 AM` : hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`
  }

  const calculatePrice = () => {
    console.log("initialSelectedRoom", initialSelectedRoom)
    if (!initialSelectedRoom) return 0

    console.log("room", initialSelectedRoom)

    const room = initialSelectedRoom
    const basePrice = bookingType === 'hourly'
      ? parseFloat(room.hourly_rate)
      : parseFloat(room.daily_rate)

    let duration = 0

    if (bookingType === 'hourly' && checkInTime && checkOutTime && date) {
      const startTime = new Date(date)
      const endTime = new Date(date)
      startTime.setHours(parseInt(checkInTime, 10), 0, 0, 0)
      endTime.setHours(parseInt(checkOutTime, 10), 0, 0, 0)
      duration = (endTime.getTime() - startTime.getTime()) / (1000 * 3600)
    } else if (date && checkOut) {
      duration = (checkOut.getTime() - date.getTime()) / (1000 * 3600 * 24)
    }

    const price_with_discount = basePrice * duration * rooms
    const discount = price_with_discount * (initialSelectedRoom?.discount || 0) / 100
    const price_after_discount = price_with_discount - discount

    return price_after_discount
  }

  const totalPrice = calculatePrice()
  const taxes = totalPrice * 0.18 // 18% GST
  const discountedPrice = totalPrice - (totalPrice * (initialSelectedRoom?.discount || 0) / 100)
  const offerDiscount = selectedOffer ? (totalPrice * parseFloat(selectedOffer.offer.discount_percentage)) / 100 : 0
  const finalPrice = discountedPrice - offerDiscount + taxes

  return (
    <Card className="w-[380px] bg-white shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">₹{Math.round(finalPrice)}</span>
              {initialSelectedRoom?.discount > 0 && (
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
                  variant={"outline"}
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
                    <SelectValue placeholder="Select time" />
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
                    <SelectValue placeholder="Select time" />
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
          ) : (
            <div>
              <Label>Check-out Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
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
          )}

          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Room Selection */}
        {initialSelectedRoom && (
          <div className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <span className="font-medium">
                {'name' in initialSelectedRoom ? initialSelectedRoom.name : initialSelectedRoom.occupancyType}
              </span>
              <p className="text-sm text-gray-500">
                {bookingType === 'hourly' 
                  ? `₹${initialSelectedRoom.hourly_rate}/hour`
                  : `₹${initialSelectedRoom.daily_rate}/night`
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
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOffer(null)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          ) : (
            <Select onValueChange={(value) => setSelectedOffer(property.offers.find(o => o.offer.code === value) || null)}>
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
        }}>
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

