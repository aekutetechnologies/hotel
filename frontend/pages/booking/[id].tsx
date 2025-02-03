'use client'

import { useState } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useRouter } from 'next/router'

const hotel = {
  id: 1,
  name: "Super Hotel O Four Bungalow formerly Ardaas Residency",
  location: "Near Janki Devi Public School, Andheri West, Mumbai",
  rating: 4.7,
  reviews: 214,
  rooms: [
    { name: "Deluxe", price: 3142, originalPrice: 11371, size: "13 sqm" },
    { name: "Suite", price: 4316, originalPrice: 15614, size: "18 sqm" }
  ],
}

export default function Booking() {
  const router = useRouter()
  const { id, room } = router.query
  const selectedRoom = hotel.rooms.find(r => r.name === room) || hotel.rooms[0]
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the booking data to your backend
    console.log('Booking submitted:', formData)
    // For now, we'll just redirect to a confirmation page
    router.push('/booking-confirmation')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Complete your booking</h1>
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <p className="font-bold">Yay! you just saved ₹{selectedRoom.originalPrice - selectedRoom.price} on this booking!</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Enter your details</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                  <div className="flex mt-1">
                    <Select className="w-20 mr-2">
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      {/* Add more country codes as needed */}
                    </Select>
                    <Input
                      type="tel"
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      required
                      className="flex-grow"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white">
                  Proceed to Payment
                </Button>
              </div>
            </form>
          </div>
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">{hotel.name}</span></p>
              <p>{hotel.location}</p>
              <p>{selectedRoom.name} • 1 Night • 1 Room • 1 Guest</p>
              <div className="flex justify-between items-center mt-4">
                <span>Room price for 1 Night X 1 Guest</span>
                <span>₹{selectedRoom.originalPrice}</span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span>Discount</span>
                <span>-₹{selectedRoom.originalPrice - selectedRoom.price}</span>
              </div>
              <div className="flex justify-between items-center font-semibold text-lg mt-2 pt-2 border-t">
                <span>Payable Amount</span>
                <span>₹{selectedRoom.price}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

