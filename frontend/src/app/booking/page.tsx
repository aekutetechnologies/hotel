'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, CalendarIcon, PackageSearch, Clock, Bed, X, FileText } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getUserBookings } from '@/lib/api/fetchUserBookings'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Booking } from '@/types/booking'
import { format, parseISO } from 'date-fns'
import { createUserReview } from '@/lib/api/createUserReview'
import { getBookingReview } from '@/lib/api/fetchBookingReview'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { generatePDFInvoice } from '@/lib/invoice/generatePDFInvoice'

// Extend the room interface to include rate information
interface ExtendedBookingProperty {
  id: number
  name: string
  description: string
  location: string
  area: string
  city?: { name: string }
  state?: { name: string }
  country?: { name: string }
  rooms: {
    id: number
    name: string
    amenities?: { id: number; name: string }[]
    hourly_rate?: string
    daily_rate?: string
    monthly_rate?: string
    discount?: string
  }[]
  images: { image: string }[]
  reviews?: {
    id: number
    user: { name: string }
    rating: number
    review: string
    created_at: string
    images?: string[]
  }[]
}

interface ExtendedBooking extends Booking {
  created_at?: string
  property: ExtendedBookingProperty
}

export default function BookingPage() {
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<number>(0)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [reviewMode, setReviewMode] = useState<'write' | 'view'>('write')
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [viewingReview, setViewingReview] = useState<{
    id: number;
    rating: number;
    review: string;
    created_at: string;
  } | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true)
      try {
        const data = await getUserBookings()
        setBookings(data)
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch bookings')
      } finally {
        setIsLoading(false)
      }
    }
    fetchBookings()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-t-[#B11E43] border-r-[#B11E43] border-b-[#B11E43] border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading your bookings...</p>
          </motion.div>
        </main>
        <Footer sectionType="hotels" />
      </div>
    )
  }

  // Function to format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy')
    } catch (error) {
      return dateString
    }
  }

  // Helper function to render booked rooms with counts
  const renderBookedRooms = (booking: Booking) => {
    if (!booking.booking_room_types || booking.booking_room_types.length === 0) {
      return (
        <div>
          <p className="font-medium">{booking.property.rooms.find(room => room.id === booking.room)?.name || 'Standard Room'}</p>
        </div>
      )
    }

    return (
      <div className="space-y-1">
        {booking.booking_room_types.map((roomTypeObj, index) => {
          const roomId = Object.keys(roomTypeObj)[0]
          const count = roomTypeObj[roomId]
          const roomDetails = booking.property.rooms.find(room => room.id === parseInt(roomId))
          
          return (
            <div key={`${roomId}-${index}`} className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-gray-500" />
              <p className="font-medium">
                {roomDetails?.name || `Room #${roomId}`} × {count}
              </p>
            </div>
          )
        })}
      </div>
    )
  }

  // Function to trigger download
  const downloadInvoice = (booking: Booking) => {
    try {
      // Generate and download PDF
      const doc = generatePDFInvoice(booking as ExtendedBooking);
      doc.save(`invoice-${booking.id}.pdf`);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate invoice. Please try again.');
    }
  }

  // Function to handle review actions
  const handleReviewAction = async (booking: Booking, mode: 'write' | 'view') => {
    setReviewMode(mode)
    setSelectedBooking(booking.id)
    setSelectedProperty(booking.property.id)
    
    if (mode === 'view' && booking.is_review_created) {
      try {
        // Look for the review in the property reviews
        const propertyReview = booking.property.reviews?.find(r => r.id == booking.review_id)
        if (propertyReview) {
          setViewingReview({
            id: propertyReview.id,
            rating: propertyReview.rating,
            review: propertyReview.review,
            created_at: propertyReview.created_at
          })
        } else {
          // If not found in property reviews, try the API
          const review = await getBookingReview(booking.id)
          if (review) {
            setViewingReview({
              id: review.id,
              rating: review.rating,
              review: review.review,
              created_at: review.created_at
            })
          } else {
            toast.error('Review not found')
          }
        }
      } catch (error) {
        toast.error('Failed to load review')
      }
    }
    
    setIsDialogOpen(true)
  }

  // Add cleanup function for dialog
  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setViewingReview(null)
    setSelectedRating(0)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        <div className="space-y-6">
          {bookings.length > 0 ? (
            <>
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>Booking ID: {booking.id}</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3">
                        <img
                          src={booking.property.images[0]?.image || '/images/default-image.jpg'}
                          alt={booking.property.name}
                          width={300}
                          height={200}
                          className="rounded-lg object-cover w-full h-48"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{booking.property.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {/* Booking Type */}
                          <div>
                            <p className="text-sm text-gray-500">Booking Type</p>
                            <p className="font-medium capitalize">
                              {booking.booking_time === 'daily' ? 'Daily' : 
                               booking.booking_time === 'hourly' ? 'Hourly' : 
                               booking.booking_time === 'monthly' ? 'Monthly' : booking.booking_time}
                            </p>
                          </div>
                          
                          {/* Amount */}
                          <div>
                            <p className="text-sm text-gray-500">Amount Paid</p>
                            <p className="font-medium">₹{booking.price}</p>
                          </div>
                          
                          {/* Check-in Date (for all booking types) */}
                          <div>
                            <p className="text-sm text-gray-500">Check-in Date</p>
                            <p className="font-medium">{formatDate(booking.checkin_date)}</p>
                          </div>
                          
                          {/* Check-out Date (for daily and monthly) */}
                          {booking.booking_time !== 'hourly' && (
                            <div>
                              <p className="text-sm text-gray-500">Check-out Date</p>
                              <p className="font-medium">{formatDate(booking.checkout_date)}</p>
                            </div>
                          )}
                          
                          {/* Check-in Time (for hourly) */}
                          {booking.booking_time === 'hourly' && booking.checkin_time && (
                            <div>
                              <p className="text-sm text-gray-500">Check-in Time</p>
                              <div className="font-medium flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                {booking.checkin_time}
                              </div>
                            </div>
                          )}
                          
                          {/* Check-out Time (for hourly) */}
                          {booking.booking_time === 'hourly' && booking.checkout_time && (
                            <div>
                              <p className="text-sm text-gray-500">Check-out Time</p>
                              <div className="font-medium flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                {booking.checkout_time}
                              </div>
                            </div>
                          )}
                          
                          {/* Room Details */}
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-500 mb-1">Room Details</p>
                            {renderBookedRooms(booking)}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4">
                          {booking.status === 'completed' || booking.status === 'checked_out' && !booking.is_review_created && (
                            <Button
                              variant="neutral"
                              onClick={() => handleReviewAction(booking, 'write')}
                            >
                              Write a Review
                            </Button>
                          )}
                          
                          {booking.status === 'completed' || booking.status === 'checked_out' && booking.is_review_created && (
                            <Button
                              variant="neutral"
                              onClick={() => handleReviewAction(booking, 'view')}
                            >
                              View Review
                            </Button>
                          )}
                          
                          <Button 
                            variant="neutral" 
                            className="text-[#B11E43] border-[#B11E43]"
                            onClick={() => downloadInvoice(booking)}
                          >
                            Download Invoice
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <motion.div 
              className="flex flex-col items-center justify-center py-16 px-8 bg-white rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-6"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    repeatType: "loop" 
                  }}
                >
                  <CalendarIcon className="w-16 h-16 text-[#B11E43]" />
                </motion.div>
              </motion.div>
              
              <motion.h2 
                className="text-2xl font-bold text-gray-800 mb-2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                No Bookings Found
              </motion.h2>
              
              <motion.p 
                className="text-gray-600 mb-8 max-w-md text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                You haven't made any bookings yet. Start your journey by exploring our amazing hotels and hostels!
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/home?section=hotels">
                  <Button className="bg-[#B11E43] hover:bg-[#8f1836] text-white px-6 py-2 flex items-center gap-2">
                    <PackageSearch className="w-5 h-5" />
                    Explore Hotels
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          if (!open) handleDialogClose()
          else setIsDialogOpen(true)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewMode === 'write' ? 'Write a Review' : 'Your Review'}
            </DialogTitle>
          </DialogHeader>
          
          {reviewMode === 'write' ? (
            <form 
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const review = formData.get('review') as string

                try {
                  const reviewData = {
                    booking_id: selectedBooking!,
                    rating: selectedRating,
                    review,
                    property: selectedProperty
                  }

                  // Define proper type for review response
                  interface ReviewResponse {
                    id: number;
                    booking: number;
                    property: number;
                    rating: number;
                    review: string;
                    created_at: string;
                  }

                  const response = await createUserReview(reviewData) as ReviewResponse
                  
                  // Update the booking in the state to reflect the review has been created
                  setBookings(prevBookings => 
                    prevBookings.map(booking => 
                      booking.id === selectedBooking 
                        ? { 
                            ...booking, 
                            is_review_created: true,
                            review_id: response.id || 0
                          } 
                        : booking
                    )
                  )
                  
                  toast.success('Review submitted successfully!')
                  handleDialogClose()
                } catch (error: any) {
                  toast.error(error.message || 'Failed to submit review. Please try again.')
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="text-2xl focus:outline-none"
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors duration-200 ${
                          (hoverRating || selectedRating) >= star
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {selectedRating === 0 && (
                  <p className="text-sm text-red-500">Please select a rating</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Review</label>
                <textarea
                  name="review"
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder="Share your experience..."
                  required
                ></textarea>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="neutral"
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#B11E43] hover:bg-[#8f1836] text-white"
                  disabled={selectedRating === 0}
                >
                  Submit Review
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4">
              {viewingReview ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Your Rating</h3>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= viewingReview.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Your Review</h3>
                    <p className="text-gray-700 border p-3 rounded-md bg-gray-50">{viewingReview.review}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Posted on {format(new Date(viewingReview.created_at), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="neutral"
                      onClick={handleDialogClose}
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <p className="text-gray-500">Loading review...</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <ToastContainer />
      <Footer sectionType="hotels" />
    </div>
  )
}

