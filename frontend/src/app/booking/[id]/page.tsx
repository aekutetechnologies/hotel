'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileLogin } from '@/components/MobileLogin'
import { properties } from '@/lib/dummy-data'
import { Property } from '@/types/property'

export default function Booking() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const propertyId = Number(params.id)
  const roomType = searchParams.get('room')

  console.log(propertyId, roomType)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showPaymentButton, setShowPaymentButton] = useState(false)

  const property = properties.find(p => p.id === propertyId) as Property
  const selectedRoom = property?.rooms.find(r => 
    ('name' in r && r.name === roomType) || ('occupancyType' in r && r.occupancyType === roomType)
  )

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowPaymentButton(true)
  }

  const handleProceedToPayment = () => {
    // In a real application, you would redirect to a payment gateway here
    console.log('Proceeding to payment')
    router.push('/bookingconfirmation')
  }

  if (!property || !selectedRoom) {
    return <div>Property or room not found</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Complete your booking</h1>
          {!isLoggedIn ? (
            <MobileLogin onLoginSuccess={handleLoginSuccess} />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                  <CardDescription>Please fill in your details to complete the booking</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                      <Input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                      <Input
                        type="tel"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white">
                      Confirm Details
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {showPaymentButton && (
                <div className="mt-6">
                  <Button onClick={handleProceedToPayment} className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white">
                    Proceed to Payment
                  </Button>
                </div>
              )}

              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><span className="font-semibold">{property.name}</span></p>
                      <p>{property.location}</p>
                      <p>{roomType} • 1 Night • 1 Room • 1 Guest</p>
                      <div className="flex justify-between items-center mt-4">
                        <span>Room price for 1 Night X 1 Guest</span>
                        <span>₹{selectedRoom.basePrice}</span>
                      </div>
                      <div className="flex justify-between items-center text-green-600">
                        <span>Discount</span>
                        <span>-₹{selectedRoom.originalPrice - selectedRoom.basePrice}</span>
                      </div>
                      <div className="flex justify-between items-center font-semibold text-lg mt-2 pt-2 border-t">
                        <span>Payable Amount</span>
                        <span>₹{selectedRoom.basePrice}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

