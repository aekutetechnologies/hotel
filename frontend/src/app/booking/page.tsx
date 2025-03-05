'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getUserBookings } from '@/lib/api/fetchUserBookings'


export default function BookingPage() {
  console.log("BookingPage component is rendering")
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    console.log("useEffect in BookingPage is running - simplified")
  }, [])

  useEffect(() => {
    const fetchBookings = async () => {
      console.log("fetching bookings")
      setIsLoading(true)
      try {
        const data = await getUserBookings()
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

  // Function to generate invoice HTML (already defined in previous turns, ensure it's here)
  const generateInvoiceHTML = (booking: Booking): string => { 
    return `
    <html>
    <head>
      <style>
        .invoice-box {
          max-width: 800px;
          margin: auto;
          padding: 30px;
          border: 1px solid #eee;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
          font-family: 'Arial', sans-serif;
          color: #555;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        
        .company-address {
          text-align: right;
        }
        
        .invoice-title {
          font-size: 24px;
          color: #333;
          margin-bottom: 5px;
        }
        
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        .details-table td {
          padding: 12px;
          border: 1px solid #eee;
        }
        
        .details-table tr:nth-child(odd) {
          background-color: #f9f9f9;
        }
        
        .total {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          margin-top: 20px;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #eee;
          text-align: center;
          color: #777;
        }
        
        .highlight {
          color: #3498db;
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div>
            <h1 class="invoice-title">Invoice #${booking.id}</h1>
            <p>Invoice Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="company-address">
            <h2>Hsquare</h2>
            <p>123 Hospitality Street</p>
            <p>Mumbai, MH 400001</p>
            <p>GSTIN: 27ABCDE1234F1Z2</p>
          </div>
        </div>
  
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h3>Billed To:</h3>
            <p>${booking.user.name}</p>
            <p>${booking.user.email}</p>
            <p>${booking.user.mobile}</p>
          </div>
          <div>
            <h3>Booking Details:</h3>
            <p>Booking ID: ${booking.id}</p>
            <p>Check-in: ${new Date(booking.checkin_date).toLocaleDateString()}</p>
            <p>Check-out: ${new Date(booking.checkout_date).toLocaleDateString()}</p>
          </div>
        </div>
  
        <table class="details-table">
          <tr>
            <td>Property Name</td>
            <td>${booking.property.name}</td>
          </tr>
          <tr>
            <td>Room Type</td>
            <td>${booking.property.rooms.find(room => room.id === booking.room)?.name}</td>
          </tr>
          <tr>
            <td>Number of Guests</td>
            <td>${booking.number_of_guests}</td>
          </tr>
          <tr>
            <td>Base Price</td>
            <td>₹${booking.price}</td>
          </tr>
          ${booking.discount ? `
          <tr>
            <td>Discount</td>
            <td>- ₹${booking.price * booking.discount / 100}</td>
          </tr>
          ` : ''}
        </table>
  
        <div class="total">
          Total Amount: ₹${booking.price - (booking.price * booking.discount / 100 || 0)}
        </div>
  
        <div style="margin-top: 30px;">
          <h3>Payment Details:</h3>
          <p>Payment Method: ${booking.payment_type.toUpperCase()}</p>
          <p>Payment Status: <span class="highlight">${booking.status.toUpperCase()}</span></p>
        </div>
  
        <div class="footer">
          <p>Thank you for choosing Hsquare!</p>
          <p>For any inquiries, contact us at support@hsquare.in</p>
          <p>This is computer generated invoice and does not require signature</p>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  // Function to trigger download (ensure this is defined inside BookingPage)
  const downloadInvoice = (booking: Booking) => {
    const invoiceHTML = generateInvoiceHTML(booking)
    const blob = new Blob([invoiceHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${booking.id}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle>Booking ID: {booking.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3">
                    <img
                      src={booking.property.images[0].image || '/images/default-image.jpg'}
                      alt={booking.property.name}
                      width={300}
                      height={200}
                      className="rounded-lg object-cover w-full h-48"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{booking.property.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Room Type</p>
                        <p className="font-medium">{booking.property.rooms.find(room => room.id === booking.room)?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount Paid</p>
                        <p className="font-medium">₹{booking.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Check-in</p>
                        <p className="font-medium">{booking.checkin_date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Check-out</p>
                        <p className="font-medium">{booking.checkout_date}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      {booking.status === 'completed' && (
                        <Button
                          variant="outline"
                          onClick={() => setSelectedBooking(booking.id)}
                        >
                          Write a Review
                        </Button>
                      )}
                      {/* <Link href={`/booking/${booking.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link> */}
                      <Button variant="outline" className="text-[#B11E43] border-[#B11E43]"
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
      </main>
      <ToastContainer />
      <Footer />
    </div>
  )
}


interface Booking {
  id: number
  name: string
  room_type: string
  room: number
  checkin_date: string
  checkout_date: string
  price: number
  status: string
  booking_id: string
  number_of_guests: number
  discount: number
  payment_type: string
  property: {
    images: Array<{
      image: string
    }>
    name: string
    rooms: Array<{
        id: number
        name: string
    }>
  }
  user: {
    name: string
    email: string
    mobile: string
  }
}

