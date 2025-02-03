'use client'

import { useState } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Wifi, Battery, MapPin, Coffee, Tv } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
    "/placeholder.svg?height=300&width=500&text=Hotel+Image+1",
    "/placeholder.svg?height=300&width=500&text=Hotel+Image+2",
    "/placeholder.svg?height=300&width=500&text=Hotel+Image+3",
  ],
  policies: {
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    couplesWelcome: true,
  }
}

export default function HotelDetails() {
  const [selectedRoom, setSelectedRoom] = useState(hotel.rooms[0])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
          <p className="text-gray-600 mb-2">{hotel.location}</p>
          <div className="flex items-center">
            <div className="bg-green-500 text-white px-2 py-1 rounded flex items-center mr-2">
              <Star size={16} className="mr-1" />
              <span>{hotel.rating}</span>
            </div>
            <span className="text-gray-600">({hotel.reviews} Ratings) • Excellent</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {hotel.images.map((image, index) => (
            <div key={index} className={index === 0 ? "md:col-span-2" : ""}>
              <Image src={image} alt={`${hotel.name} - Image ${index + 1}`} width={800} height={600} className="rounded-lg object-cover w-full h-64 md:h-96" />
            </div>
          ))}
        </div>

        <Tabs defaultValue="rooms" className="mb-8">
          <TabsList>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="policies">Hotel Policies</TabsTrigger>
          </TabsList>
          <TabsContent value="rooms">
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
                    <div className="text-green-500 font-semibold mb-2">{Math.round((1 - room.price / room.originalPrice) * 100)}% off</div>
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
          </TabsContent>
          <TabsContent value="amenities">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hotel.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  {amenity === "AC" && <Coffee size={24} className="mr-2" />}
                  {amenity === "TV" && <Tv size={24} className="mr-2" />}
                  {amenity === "Free Wifi" && <Wifi size={24} className="mr-2" />}
                  {amenity === "Power backup" && <Battery size={24} className="mr-2" />}
                  {amenity === "Geyser" && <Coffee size={24} className="mr-2" />}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="policies">
            <ul className="list-disc list-inside space-y-2">
              <li>Check-in time: {hotel.policies.checkIn}</li>
              <li>Check-out time: {hotel.policies.checkOut}</li>
              <li>{hotel.policies.couplesWelcome ? "Couples are welcome" : "Couples are not allowed"}</li>
            </ul>
          </TabsContent>
        </Tabs>

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
          <Link href={`/booking/${hotel.id}?room=${selectedRoom.name}`}>
            <Button className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white">Book Now</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

