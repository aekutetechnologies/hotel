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

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (booking: any) => void
  title: string
  initialData?: any
  onBookingAction?: () => void
  properties: Property[]
  users: User[]
}

export function BookingModal({ isOpen, onClose, onSubmit, title, initialData, onBookingAction, properties, users }: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<{
    id: number;
    name?: string;
    images?: { id: number; image?: string; image_url?: string }[];
    roomImages?: { id: number; image_url: string }[];
    amenities?: any[];
    [key: string]: any;
  } | null>(null)

  const [booking, setBooking] = useState({
    propertyName: '',
    guestName: '',
    roomName: '',
    checkIn: '',
    checkOut: '',
    status: 'pending',
    amount: '',
    bookingType: 'walkin',
    bookingTime: 'daily',
    paymentMethod: 'upi',
    guests: '1',
    numberOfRooms: 1,
  })

  useEffect(() => {
    if (initialData && properties && properties.length > 0) {
      setBooking({
        propertyName: typeof initialData.property === 'object' ? initialData.property.name : '',
        guestName: typeof initialData.user === 'object' ? initialData.user.mobile : '',
        roomName: '',
        checkIn: initialData.checkin_date,
        checkOut: initialData.checkout_date,
        status: initialData.status,
        amount: initialData.price,
        bookingType: initialData.booking_type,
        bookingTime: initialData.booking_time || 'daily',
        paymentMethod: initialData.payment_type,
        guests: initialData.number_of_guests,
        numberOfRooms: initialData.number_of_rooms,
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
        // Find the selected room
        const initialRoom = initialProperty.rooms?.find(room => room.id === initialData.room)
        setSelectedRoom(initialRoom || null)
        
        if (initialRoom) {
          setBooking(prev => ({ 
            ...prev, 
            roomName: initialRoom.name
          }))
        }
      }
    } else {
      setBooking({
        propertyName: '',
        guestName: '',
        roomName: '',
        checkIn: '',
        checkOut: '',
        status: 'pending',
        amount: '',
        bookingType: 'walkin',
        bookingTime: 'daily',
        paymentMethod: 'upi',
        guests: '1',
        numberOfRooms: 1,
      })
      setSelectedProperty(null)
      setSelectedRoom(null)
    }
  }, [initialData, properties])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBooking(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setBooking(prev => ({ ...prev, [name]: value }))
    
    // Update price when booking time changes
    if (name === 'bookingTime' && selectedRoom) {
      updatePriceBasedOnBookingTime(value, selectedRoom)
    }
  }
  
  const updatePriceBasedOnBookingTime = (bookingTime: string, room: any) => {
    let baseRate = 0
    switch (bookingTime) {
      case 'hourly':
        baseRate = parseFloat(room.hourly_rate || '0')
        break
      case 'monthly':
        baseRate = parseFloat(room.monthly_rate || '0')
        break
      case 'daily':
      default:
        baseRate = parseFloat(room.daily_rate || '0')
    }
    
    // Apply discount if any
    const discount = parseFloat(room.discount || '0')
    const discountedPrice = baseRate - (baseRate * discount / 100)
    
    // Update the amount field
    setBooking(prev => ({ ...prev, amount: discountedPrice.toFixed(2) }))
  }

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
      const selectedUser = users.find(user => user.name === booking.guestName)
      const bookingPayload = {
        property: selectedProperty?.id,
        room: selectedRoom?.id,
        user: selectedUser?.id,
        checkin_date: booking.checkIn,
        checkout_date: booking.checkOut,
        status: booking.status,
        discount: parseFloat(selectedRoom?.discount || '0'),
        price: parseFloat(booking.amount),
        booking_type: booking.bookingType,
        booking_time: booking.bookingTime,
        payment_type: booking.paymentMethod,
        number_of_guests: parseInt(booking.guests),
        number_of_rooms: booking.numberOfRooms,
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

  // Check if property type is hostel
  const isHostel = selectedProperty?.property_type === 'hostel'

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
                  setSelectedRoom(null)
                  setBooking(prev => ({ ...prev, roomName: '', amount: '' }))
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
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  {(isHostel || selectedProperty?.property_type === 'hostel') && (
                    <SelectItem value="monthly">Monthly</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {selectedProperty && (
              <div>
                <Label htmlFor="roomName">Room Name</Label>
                <Select
                  name="roomName"
                  value={booking.roomName}
                  onValueChange={(value) => {
                    if (selectedProperty) {
                      const selectedRoom = selectedProperty.rooms?.find(room => room.name === value)
                      handleSelectChange('roomName', value)
                      setSelectedRoom(selectedRoom || null)
                      if (selectedRoom) {
                        updatePriceBasedOnBookingTime(booking.bookingTime, selectedRoom)
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Room" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProperty?.rooms?.map((room) => (
                      <SelectItem key={room.id} value={room.name || ''}>{room.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="guestName">Guest Name</Label>
              <Select
                name="guestName"
                value={booking.guestName}
                onValueChange={(value) => handleSelectChange('guestName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Guest" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.mobile}>{user.mobile}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
              <div>
                <Label htmlFor="numberOfRooms">Number of Rooms</Label>
                <Input
                  id="numberOfRooms"
                  name="numberOfRooms"
                  type="number"
                  value={booking.numberOfRooms}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkIn">Check-in Date</Label>
                <Input
                  id="checkIn"
                  name="checkIn"
                  type="date"
                  value={booking.checkIn}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out Date</Label>
                <Input
                  id="checkOut"
                  name="checkOut"
                  type="date"
                  value={booking.checkOut}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
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
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={booking.amount}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bookingType">Booking Type</Label>
                <Select name="bookingType" value={booking.bookingType} onValueChange={(value) => handleSelectChange('bookingType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select booking type" />
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
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="mr-2 h-4 w-4"/> : null}
            {initialData ? 'Update' : 'Create'} Booking
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
