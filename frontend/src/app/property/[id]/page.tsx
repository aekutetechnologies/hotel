'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, ChevronLeft, ChevronRight, Wifi, Coffee, Tv, Car, Utensils, Building2, BatteryCharging, Dumbbell, BellRing, ShieldCheck, UserRoundCheck, Beer, Soup, Building, Heater, ChefHat, AirVent } from 'lucide-react'
import Image from 'next/image'
import { Property, Hotel, Hostel, Amenity } from '@/types/property'
import { fetchProperty } from '@/lib/api/fetchProperty'
import { ReviewSection } from '@/components/ReviewSection'
import { BookingCard } from '@/components/BookingCard'
import ShowMap from '@/components/ShowMap'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { GalleryModal } from '@/components/GalleryModal'

// Sample reviews data
const reviews = [
  {
    id: 1,
    userName: "shivam kumar jha",
    date: "31 Aug 2024",
    rating: 5,
    comment: "I had a pleasant stay at this hotel. The room was clean, spacious, and well-maintained, with a comfortable bed and modern amenities. The staff were friendly and attentive, always ready to assist with a smile. The location was convenient, close to key attractions and public transport, making it easy to explore the area. Breakfast was good, offering a decent variety of options to start the day. While the hotel was mostly quiet, there was some occasional noise from the outside road. Overall, it was a comfortable and enjoyable experience, and I would consider staying here again.",
    images: ["/placeholder.svg?height=200&width=300&text=Room+Photo"]
  },
  // Add more reviews as needed
]

interface PropertyDetailsProps {
  property: Property;
}

export default function PropertyDetails() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const params = useParams()
  const router = useRouter()
  const propertyId = Number(params.id)

  const [property, setProperty] = useState<Property | null>(null)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryStartIndex, setGalleryStartIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    fetchProperty(propertyId.toString()).then((data) => {
      console.log("data", data)
      setProperty(data)
      if (data && data.rooms.length > 0) {
        setSelectedRoom(data.rooms[0])
      }
    })
  }, [propertyId])

  if (!property) {
    return <div>Loading...</div>
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  const openGallery = (index: number) => {
    setGalleryStartIndex(index)
    setIsGalleryOpen(true)
  }

  const closeGallery = () => {
    setIsGalleryOpen(false)
    console.log("isGalleryOpen initial:", isGalleryOpen)
  }

  const openGalleryModal = (index: number) => {
    setCurrentImageIndex(index)
    setShowGallery(true)
  }

  const closeGalleryModal = () => {
    setShowGallery(false)
  }

  console.log("PropertyDetails Render", {
    latitude: property?.latitude, longitude: property?.longitude
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Property Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{property.name}</h1>
          <p className="text-gray-600 flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5" />
            {property.location}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company-Serviced
            </Badge>
            <Badge variant="outline" className="bg-black text-white">
              WIZARD MEMBER
            </Badge>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50">
                <Star className="h-4 w-4 text-green-600 fill-current mr-1" />
                4.4
              </Badge>
              <span className="text-sm text-gray-600">Delightful experience</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative">
              <div
                className="aspect-video relative overflow-hidden rounded-lg cursor-pointer"
                onClick={() => openGalleryModal(currentImageIndex)}
              >
                <Image
                  src={property.images[currentImageIndex].image}
                  alt={`View ${currentImageIndex + 1}`}
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
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => openGalleryModal(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden ${
                      index === currentImageIndex ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <img
                      src={image.image}
                      alt={`Thumbnail ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.amenities.map((amenity) => {
                  const amenityIcons: { [key: string]: React.ReactNode } = {
                    "Security": <ShieldCheck className="h-5 w-5" />,
                    "Caretaker": <UserRoundCheck className="h-5 w-5" />,
                    "Reception": <BellRing className="h-5 w-5" />,
                    "Bar": < Beer className="h-5 w-5" />, // Assuming "Bar" maps to Cocktail icon
                    "Gym": <Dumbbell className="h-5 w-5" />,
                    "In-house Restaurant": <Soup className="h-5 w-5" />,
                    "Elevator": < Building className="h-5 w-5" />,
                    "Power backup": <BatteryCharging className="h-5 w-5" />,
                    "Geyser": <Heater className="h-5 w-5" />, // Assuming "Geyser" maps to HotTub icon
                    "Kitchen": <ChefHat className="h-5 w-5" />,
                    "Free Wifi": <Wifi className="h-5 w-5" />,
                    "AC": < AirVent className="h-5 w-5" />, // Assuming "AC" maps to кондиционер icon
                    "TV": <Tv className="h-5 w-5" />, // Keeping TV and Wifi as they were already present
                    "Coffee": <Coffee className="h-5 w-5" />, // Keeping Coffee as it was already present
                    "Utensils": <Utensils className="h-5 w-5" />, // Keeping Utensils as it was already present
                  }
                  const IconComponent = amenityIcons[(amenity.name as string)] || null // Default to null if no icon found

                  return (
                    <div key={amenity.id} className="flex items-center gap-2 p-4 border rounded-lg">
                      {IconComponent}
                      <span>{amenity.name}</span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Room Types */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Available Rooms</h2>
              <div className="space-y-4">
                {property.rooms.map((room) => (
                  <div key={'name' in room ? room.name : room.occupancyType} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{'name' in room ? room.name : room.occupancyType}</h3>
                        <p className="text-gray-600 mb-2">{'size' in room ? `Room size: ${room.size}` : `Available beds: ${room.availableBeds}/${room.totalBeds}`}</p>
                        <div className="flex gap-2">
                          {room.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline">{(amenity as string)}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#B11E43]">
                          ₹{(room.price ? parseFloat(room.price) * (1 - (parseFloat(room.discount || '0') / 100)) : 0).toFixed(2)}
                        </div>
                        <div className="text-gray-500 line-through">₹{room.price}</div>
                        <Button
                          onClick={() => setSelectedRoom(room)}
                          variant={selectedRoom === room ? "default" : "outline"}
                          className={selectedRoom === room ? "bg-[#B11E43] hover:bg-[#8f1836]" : ""}
                        >
                          {selectedRoom === room ? "Selected" : "Select"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* About */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">About this property</h2>
              <p className="text-gray-700">{property.description}</p>
            </section>

            {/* Map Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Location</h2>
              {property.latitude && property.longitude && (
                <ShowMap
                  latitude={parseFloat(property.latitude)}
                  longitude={parseFloat(property.longitude)}
                />
              )}
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Ratings and reviews</h2>
              <ReviewSection reviews={reviews} />
            </section>

            {/* Policies */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">House Rules & Policies</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.rules && property.rules.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Check-in/Check-out</h3>
                      {property.rules.map((rule, index) => (
                        <li key={rule.id}>{rule.name}</li>
                      ))}
                    </div>
                  )}
                  {property.documentation && property.documentation.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Documentation</h3>
                      {property.documentation.map((doc, index) => (
                        <li key={doc.id}>{doc.name}</li>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <BookingCard
              propertyId={property.id}
              propertyType={property.property_type}
              rooms={property.rooms}
              selectedRoom={selectedRoom}
              onRoomSelect={setSelectedRoom}
            />
          </div>
        </div>
      </main>
      <Footer />

      {showGallery && (
        <GalleryModal
          images={property.images.map(img => img.image)}
          initialIndex={currentImageIndex}
          onClose={closeGalleryModal}
        />
      )}
    </div>
  )
}

