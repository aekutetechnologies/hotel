'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { getUserBookings } from '@/lib/api/fetchUserBookings'
import { LoadingIndicator } from '@/components/ui/LoadingIndicator'

export function UserBookings() {
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    console.log("fetching bookings")
    const fetchBookings = async () => {
      console.log("fetching bookings 1")
      setIsLoading(true)
      try {
        console.log("fetching bookings 2")
        const data = await getUserBookings()
        console.log("fetching bookings 3")
        console.log(data)
        
        // Process the data to ensure we have primitive values
        const processedData = data.map((booking: any) => {
          // If we get a raw booking object with nested objects
          return {
            id: booking.id ?? 0,
            booking_id: booking.booking_id ?? booking.id?.toString() ?? '',
            hotel_name: typeof booking.property === 'object' ? booking.property.name : 
                        (typeof booking.property === 'string' ? booking.property : ''),
            room_type: typeof booking.room === 'object' ? booking.room.name : 'Standard Room',
            check_in: booking.checkin_date ?? '',
            check_out: booking.checkout_date ?? '',
            amount: booking.price ?? 0,
            status: booking.status ?? 'Pending',
            image: typeof booking.property === 'object' && booking.property.images?.length > 0 
                  ? (booking.property.images[0].image ?? '/placeholder.jpg') 
                  : '/placeholder.jpg'
          };
        });
        
        setBookings(processedData)
      } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred'
        console.error("Error updating booking:", errorMessage)
        toast.error(`Error: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBookings()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full py-8 flex justify-center">
        <LoadingIndicator 
          variant="pulse" 
          size="md" 
          text="Loading your bookings..." 
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {bookings.length > 0 ? bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <CardTitle>Booking ID: {booking.booking_id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <Image
                  src={booking.image}
                  alt={booking.hotel_name}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover w-full h-48"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{booking.hotel_name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Room Type</p>
                    <p className="font-medium">{booking.room_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount Paid</p>
                    <p className="font-medium">₹{booking.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-in</p>
                    <p className="font-medium">{booking.check_in}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-out</p>
                    <p className="font-medium">{booking.check_out}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  {booking.status === 'Completed' || booking.status === 'checked_out' && (
                    <Button
                      variant="neutral"
                      onClick={() => setSelectedBooking(booking.id)}
                    >
                      Write a Review
                    </Button>
                  )}
                  <Link href={`/booking/${booking.id}`}>
                    <Button variant="neutral">View Details</Button>
                  </Link>
                  <Button variant="neutral" className="text-[#B11E43] border-[#B11E43]">
                    Download Invoice
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">You don't have any bookings yet.</p>
            <Link href="/home?section=hotels" className="block mt-4">
              <Button variant="default" className="bg-[#B11E43] hover:bg-[#8f1836] text-white">
                Explore Properties
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {selectedBooking && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="text-2xl focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 text-gray-300 hover:text-yellow-400 hover:fill-yellow-400`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Review</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder="Share your experience..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Add Photos</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="review-image-upload"
                />
                <label htmlFor="review-image-upload">
                  <Button type="button" variant="neutral" className="cursor-pointer">
                    Upload Photos
                  </Button>
                </label>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => setSelectedBooking(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" className="bg-[#B11E43] hover:bg-[#8f1836] text-white">
                  Submit Review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface Booking {
  id: number
  booking_id: string
  hotel_name: string
  room_type: string
  check_in: string
  check_out: string
  amount: number
  status: string
  image: string
}

