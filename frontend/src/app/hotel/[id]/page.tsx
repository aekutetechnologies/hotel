'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { Star, Wifi, Battery, MapPin, Coffee, Tv, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import { ReviewSection } from '@/components/ReviewSection'
import { HelpSection } from '@/components/HelpSection'
import { Map } from '@/components/Map';

const hotel = {
  id: 1,
  name: "Super Hotel O Four Bungalow formerly Ardaas Residency",
  location: "Near Janki Devi Public School, Andheri West, Mumbai",
  rating: 4.7,
  reviews: 214,
  amenities: ["AC", "TV", "Free Wifi", "Power backup", "Geyser"],
  description: "Affordable hotel at prime location",
  rooms: [
    { name: "Deluxe", price: 3142, originalPrice: 11371, size: "13 sqm" },
    { name: "Suite", price: 4316, originalPrice: 15614, size: "18 sqm" }
  ],
  images: [
    "/placeholder.svg?height=300&width=500&text=Hotel+Room+1",
    "/placeholder.svg?height=300&width=500&text=Hotel+Room+2",
    "/placeholder.svg?height=300&width=500&text=Hotel+Room+3",
  ],
  policies: {
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    couplesWelcome: true,
  }
}

export default function HotelDetails() {
  const [selectedRoom, setSelectedRoom] = useState(hotel.rooms[0])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const router = useRouter()
  const params = useParams()
  const hotelId = params.id

  const handleBooking = () => {
    router.push(`/booking/${hotelId}?room=${selectedRoom.name}`)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="relative mb-8">
          <div className="aspect-[2/1] relative overflow-hidden rounded-lg">
            <Image
              src={hotel.images[currentImageIndex]}
              alt={`Room view ${currentImageIndex + 1}`}
              fill
              className="object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex gap-2 mt-2 overflow-x-auto">
            {hotel.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden ${
                  index === currentImageIndex ? 'ring-2 ring-primary' : ''
                }`}
              >
                <Image src={image} alt={`Room thumbnail ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Hotel Info */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{hotel.name}</h1>
                <Badge variant="secondary">NEW</Badge>
              </div>
              <p className="text-gray-600 mb-2">{hotel.location}</p>
              <div className="flex items-center">
                <div className="bg-green-500 text-white px-2 py-1 rounded flex items-center mr-2">
                  <Star size={16} className="mr-1" />
                  <span>{hotel.rating}</span>
                </div>
                <span className="text-gray-600">({hotel.reviews} Ratings) • Excellent</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#B11E43]">₹{selectedRoom.price}</div>
              <div className="text-gray-500 line-through">₹{selectedRoom.originalPrice}</div>
              <div className="text-green-500 font-semibold">
                {Math.round((1 - selectedRoom.price / selectedRoom.originalPrice) * 100)}% off
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Info Sections */}
        <div className="space-y-8 mt-8">
          {/* Rooms Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Rooms</h2>
            <div className="space-y-4">
              {hotel.rooms.map((room) => (
                <div key={room.name} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                    <p className="text-gray-600">Room size: {room.size}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#B11E43] mb-1">₹{room.price}</div>
                    <div className="text-gray-500 line-through mb-1">₹{room.originalPrice}</div>
                    <div className="text-green-500 font-semibold mb-2">
                      {Math.round((1 - room.price / room.originalPrice) * 100)}% off
                    </div>
                    <Button 
                      className="bg-[#B11E43] hover:bg-[#8f1836] text-white"
                      onClick={() => setSelectedRoom(room)}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Amenities Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hotel.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center p-4 border rounded-lg">
                  {amenity === "AC" && <Coffee size={24} className="mr-2" />}
                  {amenity === "TV" && <Tv size={24} className="mr-2" />}
                  {amenity === "Free Wifi" && <Wifi size={24} className="mr-2" />}
                  {amenity === "Power backup" && <Battery size={24} className="mr-2" />}
                  {amenity === "Geyser" && <Coffee size={24} className="mr-2" />}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
            <ReviewSection hotelId={hotelId} />
          </section>

          {/* Hotel Policies Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Hotel Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Check-in/Check-out</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Check-in time:</span>
                    <span className="font-medium">{hotel.policies.checkIn}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Check-out time:</span>
                    <span className="font-medium">{hotel.policies.checkOut}</span>
                  </li>
                </ul>
              </div>
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Property Rules</h3>
                <ul className="space-y-2">
                  <li>{hotel.policies.couplesWelcome ? "✓ Couples are welcome" : "✗ Couples are not allowed"}</li>
                  <li>✓ Local IDs accepted</li>
                  <li>✓ Pets not allowed</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Booking Summary</h2>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold">{selectedRoom.name}</h3>
              <p className="text-gray-600">1 Night • 1 Room • 1 Guest</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#B11E43]">₹{selectedRoom.price}</div>
              <div className="text-gray-500 line-through">₹{selectedRoom.originalPrice}</div>
            </div>
          </div>
          <Button className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white" onClick={handleBooking}>
            Book Now
          </Button>
        </div>

        {/* Google Maps Location */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Location</h2>
          <Map location={hotel.location} />
        </section>
      </main>
      <Footer />
    </div>
  )
}

