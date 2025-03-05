'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Property } from '@/types/property'
import { fetchProperty } from '@/lib/api/fetchProperty'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { bookProperty } from '@/lib/api/bookProperty'
import { SignIn } from '@/components/SignIn'


export default function BookProperty() {
  const params = useParams()
  const router = useRouter()
  const propertyId = Number(params.id)
  const searchParams = useSearchParams()

  const [property, setProperty] = useState<Property | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<any>(null) // type it later
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false) // Track login status
  const [showSignIn, setShowSignIn] = useState<boolean>(false) // State for SignIn modal

  useEffect(() => {
    // Check for token to determine login status (example - adjust as per your auth method)
    const token = localStorage.getItem('accessToken'); // Or however you store your token
    setIsLoggedIn(!!token); // Set isLoggedIn based on token presence

    // Fetch property details
    fetchProperty(propertyId.toString()).then((data) => {
      setProperty(data)
      if (data && data.rooms.length > 0) {
        setSelectedRoom(data.rooms[0]) // Select the first room by default
      }
    })
  }, [propertyId])

  const checkInDateParam = searchParams.get('checkInDate') || '';
  const checkOutDateParam = searchParams.get('checkOutDate') || '';
  const guestsParam = searchParams.get('guests') || '1';

  const [booking, setBooking] = useState({
    checkIn: checkInDateParam,
    checkOut: checkOutDateParam,
    guests: guestsParam,
    roomId: selectedRoom?.id, // Initialize with selectedRoom id if available
    checkInDate: checkInDateParam,
    checkOutDate: checkOutDateParam,
  })

  useEffect(() => {
    // Update roomId in booking state when selectedRoom changes
    setBooking(prevBooking => ({
      ...prevBooking,
      roomId: selectedRoom?.id,
      roomType: selectedRoom?.name || selectedRoom?.occupancyType // Keep roomType for display if needed
    }))
  }, [selectedRoom?.id, selectedRoom?.name, selectedRoom?.occupancyType])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBooking(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setBooking(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom) {
      alert('Please select a room type.')
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Please log in to book.')
      return
    }

    const bookingData = {
      user: localStorage.getItem('userId'), // Assuming userId is stored in localStorage
      property: propertyId,
      room: selectedRoom.id,
      price: parseFloat(selectedRoom.price || '0'),
      discount: parseFloat(selectedRoom.discount || '0'),
      booking_type: 'walkin', // Default to 'hotel' if property type is missing
      payment_type: 'upi', // Default payment type, can be updated later
      checkin_date: booking.checkIn,
      checkout_date: booking.checkOut,
      number_of_guests: parseInt(booking.guests, 10),
      number_of_rooms: 1, // Assuming always booking 1 room for now
      token: token,
    }


    try {
      const response = await bookProperty(bookingData)
      console.log("Booking Response:", response)
      if (response) {
        router.push('/bookingconfirmation') // Redirect to confirmation on success
      } else {
        alert(`Booking failed}`) // Show error message
      }
    } catch (error: any) {
      alert(`Booking error: ${error.message}`) // Show error message
    }
  }

  if (!property) {
    return <div>Loading property details...</div> // Or a loading spinner
  }

  return (
    <>
    {!isLoggedIn ? (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-center mb-4">Please sign in to continue your booking</p>
        <Button
          className="bg-[#B11E43] text-white hover:bg-[#8f1836]"
          onClick={() => setShowSignIn(true)}
        >
          Sign In to Book
        </Button>
        {showSignIn && <SignIn onClose={() => setShowSignIn(false)} setIsLoggedIn={setIsLoggedIn} />}
      </div>
    ) : ( // Conditionally render booking form based on login
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Book Your Stay at {property.name}</CardTitle>
            <CardDescription>{property.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700">Check-in Date</label>
                  <Input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    value={booking.checkIn}
                    defaultValue={checkInDateParam}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700">Check-out Date</label>
                  <Input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    value={booking.checkOut}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="guests" className="block text-sm font-medium text-gray-700">Number of Guests</label>
                <Select
                  value={booking.guests}
                  onValueChange={(value) => handleSelectChange('guests', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select number of guests" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">Room Type</label>
                <Select
                  value={selectedRoom?.name || selectedRoom?.occupancyType || ''} // Display selected room name
                  onValueChange={(value) => {
                    const room = property.rooms.find(room => (room.name || room.occupancyType) === value);
                    setSelectedRoom(room)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {property.rooms.map((room) => (
                      <SelectItem
                        key={room.id}
                        value={room.name || room.occupancyType}
                        onClick={() => setSelectedRoom(room)} // Update selectedRoom on item click
                      >
                        {room.name || room.occupancyType} - ₹{formatPrice(room.price ? parseFloat(room.price) * (1 - (parseFloat(room.discount || '0') / 100)) : 0)}
                        {room.discount && parseFloat(room.discount) > 0 && (
                          <Badge variant="secondary" className="ml-2 text-orange-600 bg-orange-50">
                            {room.discount}% off
                          </Badge>
                        )}
                        {room.discount && parseFloat(room.discount) > 0 && (
                          <span className="text-gray-500 line-through text-sm ml-1">
                            ₹{formatPrice(room.price ? parseFloat(room.price) : 0)}
                          </span>
                        )}
                        {!room.discount && (
                          <span className="ml-2">
                             ₹{formatPrice(room.price ? parseFloat(room.price) : 0)}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white">
                Confirm Booking
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
    )}
    </>
  )
}

