'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { getUserBookings } from '@/lib/api/fetchUserBookings'

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
        setBookings(data)
      } catch (error) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBookings()
  }, [])

  if (isLoading) {
    return <div>Loading bookings...</div>
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
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
                  {booking.status === 'Completed' && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedBooking(booking.id)}
                    >
                      Write a Review
                    </Button>
                  )}
                  <Link href={`/booking/${booking.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                  <Button variant="outline" className="text-[#B11E43] border-[#B11E43]">
                    Download Invoice
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

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
                  <Button type="button" variant="outline" className="cursor-pointer">
                    Upload Photos
                  </Button>
                </label>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedBooking(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#B11E43] hover:bg-[#8f1836] text-white">
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
  hotel_name: string
  room_type: string
  check_in: string
  check_out: string
  amount: number
  status: string
  booking_id: string
  image: string
}

