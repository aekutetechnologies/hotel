'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateBooking } from '@/lib/api/updateBooking'
import { Spinner } from "@/components/ui/spinner"
import { Property } from '@/types/property'
import { User } from '@/types/user'
import { toast } from 'react-toastify'
import { CalendarDays, Plus, Minus, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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

// Extend the Property type to include offers
interface ExtendedProperty extends Property {
  offers?: Offer[]
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (booking: any) => void
  title: string
  initialData?: any
  onBookingAction?: () => void
  properties: ExtendedProperty[]
  users: User[]
}

export function BookingModal({ isOpen, onClose, onSubmit, title, initialData, onBookingAction, properties, users }: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [selectedProperty, setSelectedProperty] = useState<ExtendedProperty | null>(null)
  const [selectedRooms, setSelectedRooms] = useState<Map<string, any>>(new Map())
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)

  const [booking, setBooking] = useState<{
    propertyName: string
    mobile: string
    checkIn: string
    checkOut: string
    status: string
    amount: string
    offer_id: number,
    bookingType: string
    bookingTime: string
    paymentMethod: string
    guests: string
    numberOfRooms: number
    months: number
    checkInTime: string
    checkOutTime: string
  }>({
    propertyName: '',
    mobile: '',
    checkIn: '',
    checkOut: '',
    status: 'pending',
    amount: '',
    offer_id: 0,
    bookingType: 'walkin',
    bookingTime: 'daily',
    paymentMethod: 'upi',
    guests: '1',
    numberOfRooms: 1,
    months: 1,
    checkInTime: '12',
    checkOutTime: '14',
  })

  // State for price details to avoid recalculation during render
  const [priceDetails, setPriceDetails] = useState({
    basePrice: 0,
    averageDiscount: 0,
    discountedPrice: 0,
    offerDiscount: 0,
    taxes: 0,
    finalPrice: 0
  })

  // Check if property type is hostel
  const isHostel = selectedProperty?.property_type === 'hostel'

  useEffect(() => {
    // Set the appropriate bookingTime based on property type
    if (selectedProperty) {
      setBooking(prev => ({
        ...prev,
        bookingTime: isHostel ? 'monthly' : 'daily'
      }))
    }
  }, [selectedProperty, isHostel])

  useEffect(() => {
    if (initialData && properties && properties.length > 0) {
      setBooking({
        propertyName: typeof initialData.property === 'object' ? initialData.property.name : '',
        mobile: typeof initialData.user === 'object' ? initialData.user.mobile : '',
        checkIn: initialData.checkin_date || '',
        checkOut: initialData.checkout_date || '',
        status: initialData.status || 'pending',
        amount: initialData.price || '',
        offer_id: initialData.offer_id || 0,
        bookingType: initialData.booking_type || 'walkin',
        bookingTime: initialData.booking_time || 'daily',
        paymentMethod: initialData.payment_type || 'upi',
        guests: initialData.number_of_guests || '1',
        numberOfRooms: initialData.number_of_rooms || 1,
        months: initialData.months || 1,
        checkInTime: initialData.check_in_time || '12',
        checkOutTime: initialData.check_out_time || '14',
      })
      
      // Find the selected property
      const initialProperty = properties.find(property => {
        if (typeof initialData.property === 'object') {
          return property.id === initialData.property.id
        } else {
          return property.id === initialData.property
        }
      })
      
      setSelectedProperty(initialProperty || null)
      
      if (initialProperty) {
        // Initialize selected rooms based on initialData
        const roomsMap = new Map()
        if (initialData.room) {
        const initialRoom = initialProperty.rooms?.find(room => room.id === initialData.room)
          if (initialRoom) {
              roomsMap.set(initialRoom.id.toString(), {
                ...initialRoom,
                quantity: 1
              })
            }
        }
        setSelectedRooms(roomsMap)
        
        // Initialize selected offer if offer_id exists
        if (initialData.offer_id && initialProperty.offers && initialProperty.offers.length > 0) {
          // Convert offer_id to number if it's a string
          const offerIdNum = typeof initialData.offer_id === 'string' 
            ? parseInt(initialData.offer_id, 10)
            : initialData.offer_id;
            
          // Try to find by offer.id
          let initialOffer = initialProperty.offers.find(offer => offer.id === offerIdNum);
          
          // If not found, try to find by offer.offer.id
          if (!initialOffer) {
            initialOffer = initialProperty.offers.find(offer => offer.offer.id === offerIdNum);
          }
          
          if (initialOffer) {
            setSelectedOffer(initialOffer);
            console.log('Initial offer selected:', initialOffer);
          } else {
            console.log('Could not find offer with ID:', offerIdNum);
            console.log('Available offers:', initialProperty.offers);
          }
        }
      }
    } else {
      setBooking({
        propertyName: '',
        mobile: '',
        checkIn: '',
        checkOut: '',
        status: 'pending',
        amount: '',
        offer_id: 0,
        bookingType: 'walkin',
        bookingTime: 'daily',
        paymentMethod: 'upi',
        guests: '1',
        numberOfRooms: 1,
        months: 1,
        checkInTime: '12',
        checkOutTime: '14',
      })
      setSelectedProperty(null)
      setSelectedRooms(new Map())
      setSelectedOffer(null)
    }
  }, [initialData, properties])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBooking(prev => ({ ...prev, [name]: value }))
    
    // If number of rooms changes, update amount
    if (name === 'numberOfRooms') {
      // No direct call needed here, the useEffect will handle it
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setBooking(prev => ({ ...prev, [name]: value }))
    
    // Update price when booking time changes
    if (name === 'bookingTime') {
      // No direct call needed here, the useEffect will handle it
    }
  }
  
  const handleRoomQuantityChange = (roomId: string, increment: number) => {
    const roomsMapCopy = new Map(selectedRooms)
    const room = roomsMapCopy.get(roomId)
    
    if (room) {
      const newQuantity = (room.quantity || 0) + increment
      if (newQuantity <= 0) {
        roomsMapCopy.delete(roomId)
      } else {
        roomsMapCopy.set(roomId, {
          ...room,
          quantity: newQuantity
        })
      }
    } else if (increment > 0 && selectedProperty) {
      // Add room if not exists
      const roomToAdd = selectedProperty.rooms?.find(r => r.id.toString() === roomId)
      if (roomToAdd) {
        roomsMapCopy.set(roomId, {
          ...roomToAdd,
          quantity: 1
        })
      }
    }
    
    setSelectedRooms(roomsMapCopy)
    
    // Update total number of rooms
    const totalRooms = Array.from(roomsMapCopy.values()).reduce(
      (sum, room) => sum + (room.quantity || 0), 0
    )
    
    // Force price recalculation by updating booking state
    setBooking(prev => {
      const newBooking = { 
        ...prev, 
        numberOfRooms: totalRooms 
      }
      return newBooking
    })
  }
  
  const formatTime = (hour: number | string) => {
    try {
      const hourNum = typeof hour === 'string' ? parseInt(hour, 10) : hour
      if (isNaN(hourNum)) return "12:00 PM" // Default if parsing fails
      
      return hourNum === 0 ? "12:00 AM" : 
             hourNum < 12 ? `${hourNum}:00 AM` : 
             hourNum === 12 ? "12:00 PM" : 
             `${hourNum - 12}:00 PM`
    } catch (error) {
      console.error("Time formatting error:", error)
      return "12:00 PM" // Fallback
    }
  }
  
  const calculatePrice = (roomsMap = selectedRooms) => {
    // If no rooms are selected, return 0
    if (!roomsMap || roomsMap.size === 0) return 0
    
    // Get only rooms with quantity > 0
    const rooms = Array.from(roomsMap.values()).filter(room => room.quantity > 0)
    if (rooms.length === 0) return 0
    
    // Calculate price for each selected room type
    let totalPrice = 0
    
    for (const room of rooms) {
      const quantity = room.quantity || 0
      if (quantity <= 0) continue
      
      let roomPrice = 0
      
      // Check if we should use monthly rate
      if (booking.bookingTime === 'monthly' || (isHostel && room.monthly_rate && parseFloat(room.monthly_rate) > 0)) {
        // Use monthly rate for monthly bookings or hostels
        const basePrice = parseFloat(room.monthly_rate || '0')
        roomPrice = basePrice * quantity * booking.months
      } else {
        // Use hourly or daily rate based on bookingTime
        const basePrice = booking.bookingTime === 'hourly'
          ? parseFloat(room.hourly_rate || '0')
          : parseFloat(room.daily_rate || '0')
        
        let duration = 0

        if (booking.bookingTime === 'hourly' && booking.checkInTime && booking.checkOutTime) {
          const startHour = parseInt(booking.checkInTime, 10)
          const endHour = parseInt(booking.checkOutTime, 10)
          duration = endHour > startHour ? endHour - startHour : (24 - startHour) + endHour
        } else if (booking.checkIn && booking.checkOut) {
          const checkInDate = new Date(booking.checkIn)
          const checkOutDate = new Date(booking.checkOut)
          duration = Math.max(1, (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24))
        } else {
          // Default to 1 day/hour if we don't have complete date information
          duration = 1
        }

        roomPrice = basePrice * duration * quantity
      }
      
      totalPrice += roomPrice
    }

    return totalPrice
  }
  
  // Calculate average discount from all selected rooms
  const calculateAverageDiscount = () => {
    const rooms = Array.from(selectedRooms.values()).filter(room => room.quantity > 0)
    if (rooms.length === 0) return 0
    
    const totalQuantity = rooms.reduce((sum, room) => sum + (room.quantity || 0), 0)
    if (totalQuantity === 0) return 0
    
    const weightedDiscount = rooms.reduce((sum, room) => {
      const discount = room.discount ? parseFloat(String(room.discount)) : 0
      return sum + (discount * (room.quantity || 0))
    }, 0)
    
    return weightedDiscount / totalQuantity
  }
  
  // Calculate price details when dependencies change
  useEffect(() => {
    // Skip calculation if no rooms selected or dates not set
    if (!selectedRooms?.size || !booking.checkIn || !booking.checkOut) return
    
    const calculatePriceDetails = () => {
      let basePrice = 0
      let totalDiscount = 0
    
      // Calculate number of nights
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    
      // Calculate base price and discounts from selected rooms
      for (const [_, room] of selectedRooms.entries()) {
        // Get the correct rate based on booking time
        let roomRate = 0
        const quantity = room.quantity || 1
        
        if (booking.bookingTime === 'monthly') {
          roomRate = parseFloat(room.monthly_rate || '0') * booking.months
        } else if (booking.bookingTime === 'hourly' && booking.checkInTime && booking.checkOutTime) {
          const startHour = parseInt(booking.checkInTime, 10)
          const endHour = parseInt(booking.checkOutTime, 10)
          const hours = endHour > startHour ? endHour - startHour : (24 - startHour) + endHour
          roomRate = parseFloat(room.hourly_rate || '0') * hours
        } else {
          roomRate = parseFloat(room.daily_rate || '0') * nights
        }
        
        const roomDiscount = parseFloat(room.discount || '0')
        
        basePrice += roomRate * quantity
        totalDiscount += (roomRate * roomDiscount / 100) * quantity
      }
    
      const averageDiscount = basePrice > 0 
        ? (totalDiscount / basePrice) * 100 
        : 0
      
      const discountedPrice = basePrice - totalDiscount
      
      // Apply offer discount if selected
      const offerDiscount = selectedOffer 
        ? (discountedPrice * parseFloat(selectedOffer.offer.discount_percentage || '0')) / 100 
        : 0
      
      // Calculate taxes (assuming 18% GST)
      const taxRate = 0.18
      const taxes = (discountedPrice - offerDiscount) * taxRate
      
      // Calculate final price
      const finalPrice = discountedPrice - offerDiscount + taxes
      
      // Update price details state
      setPriceDetails({
        basePrice,
        averageDiscount,
        discountedPrice,
        offerDiscount, 
        taxes,
        finalPrice
      })
      
      // Update booking amount in the booking state
      setBooking(prev => ({ ...prev, amount: finalPrice.toFixed(2) }))
    }
    
    calculatePriceDetails()
  }, [selectedRooms, selectedOffer, booking.checkIn, booking.checkOut, booking.checkInTime, booking.checkOutTime, booking.bookingTime, booking.months, setBooking])

  // Update price when property selection changes
  useEffect(() => {
    if (selectedProperty) {
      // Update room prices based on property selection
      const updatedRooms = new Map(selectedRooms)
      
      // Reset and recalculate price
      if (booking.checkIn && booking.checkOut) {
        // Force price recalculation
        const checkIn = new Date(booking.checkIn)
        const checkOut = new Date(booking.checkOut)
        // Set a slight difference to trigger the other useEffect
        setBooking(prev => ({
          ...prev,
          checkIn: checkIn.toISOString().split('T')[0],
          checkOut: checkOut.toISOString().split('T')[0]
        }))
      }
    }
  }, [selectedProperty])

  // Update the offer_id in booking state when selectedOffer changes
  useEffect(() => {
    if (selectedOffer) {
      setBooking(prev => ({
        ...prev,
        offer_id: selectedOffer.id
      }))
    } else {
      setBooking(prev => ({
        ...prev,
        offer_id: 0
      }))
    }
  }, [selectedOffer])

  // Debug function to log offer details
  const logOfferDetails = () => {
    if (initialData && selectedProperty) {
      console.log('Booking data offer_id:', initialData.offer_id);
      console.log('Current booking.offer_id:', booking.offer_id);
      console.log('Selected offer:', selectedOffer);
      console.log('Available offers:', selectedProperty.offers);
    }
  };

  // Call after property and offer are set
  useEffect(() => {
    if (selectedProperty && initialData && initialData.offer_id) {
      // Log details after a short delay to ensure everything is set
      setTimeout(logOfferDetails, 500);
    }
  }, [selectedProperty, initialData, selectedOffer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const checkInDate = new Date(booking.checkIn)
    const checkOutDate = new Date(booking.checkOut)

    if (checkOutDate <= checkInDate) {
      toast.error('Check-out date must be after check-in date.')
      setIsSubmitting(false)
      return
    }

    try {
      const selectedUser = users.find(user => user.mobile === booking.mobile)
      
      // Get the first room for backward compatibility or all rooms for multi-room
      const selectedRoomsArray = Array.from(selectedRooms.entries())
      const firstRoomEntry = selectedRoomsArray.length > 0 ? selectedRoomsArray[0] : null
      
      const bookingPayload = {
        property: selectedProperty?.id,
        room: firstRoomEntry ? firstRoomEntry[0] : null, // First room ID (for compatibility)
        rooms: selectedRoomsArray.map(([id, room]) => ({
          room_id: id,
          quantity: room.quantity || 1,
          price: booking.bookingTime === 'monthly' 
            ? room.monthly_rate
            : booking.bookingTime === 'hourly'
              ? room.hourly_rate
              : room.daily_rate
        })),
        user: selectedUser?.id,
        checkin_date: booking.checkIn,
        checkout_date: booking.checkOut,
        check_in_time: booking.bookingTime === 'hourly' ? booking.checkInTime : null,
        check_out_time: booking.bookingTime === 'hourly' ? booking.checkOutTime : null,
        status: booking.status,
        discount: priceDetails.averageDiscount,
        offer: selectedOffer ? selectedOffer.id : null,
        price: parseFloat(booking.amount),
        offer_id: selectedOffer ? selectedOffer.id : 0,
        booking_type: booking.bookingType,
        booking_time: booking.bookingTime,
        payment_type: booking.paymentMethod,
        number_of_guests: parseInt(booking.guests, 10),
        number_of_rooms: booking.numberOfRooms,
        months: booking.bookingTime === 'monthly' ? booking.months : null,
      }

      if (initialData) {
        await updateBooking({ id: initialData.id, ...bookingPayload })
      } else {
        await onSubmit(bookingPayload)
      }
      onClose()
      onBookingAction?.()
    } catch (error: any) {
      console.error("Error updating booking:", error.message)
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Replace the direct calculation in the render with the state values
  const { basePrice = 0, averageDiscount = 0, discountedPrice = 0, offerDiscount = 0, taxes = 0, finalPrice = 0 } = priceDetails

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="propertyName">Property Name</Label>
              <Select
                name="propertyName"
                value={booking.propertyName}
                onValueChange={(value) => {
                  const selectedProperty = properties.find(p => p.name === value)
                  handleSelectChange('propertyName', value)
                  setSelectedProperty(selectedProperty || null)
                  setSelectedRooms(new Map())
                  setBooking(prev => ({ 
                    ...prev, 
                    bookingTime: selectedProperty?.property_type === 'hostel' ? 'monthly' : 'daily',
                    numberOfRooms: 0,
                    amount: '0'
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.name}>{property.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedProperty && (
            <div>
              <Label htmlFor="bookingTime">Booking Time</Label>
              <Select 
                name="bookingTime" 
                value={booking.bookingTime} 
                onValueChange={(value) => handleSelectChange('bookingTime', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select booking time" />
                </SelectTrigger>
                <SelectContent>
                    {/* Show booking time options based on property type */}
                    {!isHostel && (
                      <>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                      </>
                    )}
                    {isHostel && (
                    <SelectItem value="monthly">Monthly</SelectItem>
                  )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="guestName">Guest Name</Label>
              <Select
                name="mobile"
                value={booking.mobile}
                onValueChange={(value) => handleSelectChange('mobile', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Guest" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.mobile}>{user.name} ({user.mobile})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkIn">Check-in Date</Label>
                <div className="relative">
                  <Input
                    id="checkIn"
                    name="checkIn"
                    type="date"
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                    value={booking.checkIn}
                    onChange={handleChange}
                    required
                  />
                  <div className="flex items-center justify-between w-full pr-2 border rounded-md px-3 py-2">
                    <span className="text-sm">{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'Select date'}</span>
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out Date</Label>
                <div className="relative">
                  <Input
                    id="checkOut"
                    name="checkOut"
                    type="date"
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                    value={booking.checkOut}
                    onChange={(e) => {
                      handleChange(e)
                    }}
                    required
                  />
                  <div className="flex items-center justify-between w-full pr-2 border rounded-md px-3 py-2">
                    <span className="text-sm">{booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'Select date'}</span>
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
            
            {booking.bookingTime === 'hourly' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInTime">Check-in Time</Label>
                  <Select 
                    value={booking.checkInTime} 
                    onValueChange={(value) => {
                      handleSelectChange('checkInTime', value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time">
                        {formatTime(booking.checkInTime)}
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
                  <Label htmlFor="checkOutTime">Check-out Time</Label>
                  <Select 
                    value={booking.checkOutTime} 
                    onValueChange={(value) => {
                      handleSelectChange('checkOutTime', value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time">
                        {formatTime(booking.checkOutTime)}
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
            )}
            
            {booking.bookingTime === 'monthly' && (
              <div>
                <Label htmlFor="months">Number of Months</Label>
                <Input 
                  id="months"
                  name="months"
                  type="number" 
                  value={booking.months}
                  onChange={(e) => {
                    handleChange(e)
                  }}
                  min={1}
                  max={12}
                  className="mt-1"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="guests">Number of Guests</Label>
              <Input
                id="guests"
                name="guests"
                type="number"
                value={booking.guests}
                onChange={handleChange}
                min="1"
                required
              />
              {!isHostel && selectedProperty && (
                <p className="text-xs text-gray-500 mt-1">Maximum 3 guests per room</p>
              )}
            </div>
            
            {/* Room Selection */}
            {selectedProperty && selectedProperty.rooms && selectedProperty.rooms.length > 0 && (
              <div className="space-y-2">
                <Label>Room Selection</Label>
                <div className="space-y-2 mt-2">
                  {selectedProperty.rooms.map((room) => (
                    <div key={room.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{room.name}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>
                              {booking.bookingTime === 'monthly' 
                                ? `₹${room.monthly_rate || 'N/A'}/month`
                                : booking.bookingTime === 'hourly' 
                                  ? `₹${room.hourly_rate || 'N/A'}/hour`
                                  : `₹${room.daily_rate || 'N/A'}/night`
                              }
                            </span>
                            {room.discount && parseFloat(room.discount) > 0 && 
                              <Badge className="ml-2 bg-green-50 text-green-600" variant="secondary">
                                {room.discount}% off
                              </Badge>
                            }
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="neutral"
                            className="h-8 w-8 p-0"
                            onClick={() => handleRoomQuantityChange(room.id.toString(), -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-6 text-center">
                            {selectedRooms.get(room.id.toString())?.quantity || 0}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="neutral"
                            className="h-8 w-8 p-0"
                            onClick={() => handleRoomQuantityChange(room.id.toString(), 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Offer Selection */}
            {selectedProperty && selectedProperty.offers && selectedProperty.offers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="offer">Apply Offer</Label>
                {selectedOffer ? (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-medium">{selectedOffer.offer.code}</p>
                      <p className="text-sm text-gray-500">{selectedOffer.offer.title}</p>
                      <p className="text-xs text-gray-400">ID: {selectedOffer.id} (offer_id: {booking.offer_id})</p>
                    </div>
                    <Button
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={() => {
                        setSelectedOffer(null)
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Select onValueChange={(value) => {
                    const offer = selectedProperty.offers ? selectedProperty.offers.find((o: any) => o.offer.code === value) : null;
                    setSelectedOffer(offer || null)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an offer" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProperty.offers && selectedProperty.offers.map((offer: Offer) => (
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
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" value={booking.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select name="paymentMethod" value={booking.paymentMethod} onValueChange={(value) => handleSelectChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="bookingType">Booking Source</Label>
              <Select name="bookingType" value={booking.bookingType} onValueChange={(value) => handleSelectChange('bookingType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select booking source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walkin">Walk-in</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="makemytrip">MakeMyTrip</SelectItem>
                  <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                  <SelectItem value="expedia">Expedia</SelectItem>
                  <SelectItem value="agoda">Agoda</SelectItem>
                  <SelectItem value="bookingcom">Booking.com</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Price Breakdown */}
            {selectedRooms.size > 0 && (
              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Room Charges</span>
                      <span>₹{Math.round(basePrice)}</span>
                    </div>
                    {averageDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Room Discount ({averageDiscount.toFixed(0)}%)</span>
                        <span>-₹{Math.round(basePrice * averageDiscount / 100)}</span>
                      </div>
                    )}
                    {selectedOffer && (
                      <div className="flex justify-between text-green-600">
                        <span>Offer Discount ({selectedOffer.offer.discount_percentage}%)</span>
                        <span>-₹{Math.round(offerDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Taxes (18%)</span>
                      <span>₹{Math.round(taxes)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Price</span>
                      <span>₹{Math.round(finalPrice)}</span>
                    </div>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Final price is calculated based on selected rooms and dates
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <Button type="submit" className="w-full bg-[#B11E43] hover:bg-[#8f1836]" disabled={isSubmitting || !selectedProperty || selectedRooms.size === 0}>
            {isSubmitting ? <Spinner className="mr-2 h-4 w-4"/> : null}
            {initialData ? 'Update' : 'Create'} Booking
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

