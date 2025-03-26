'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, ChevronLeft, ChevronRight, Wifi, Coffee, Tv, Car, Utensils, Building2, BatteryCharging, Dumbbell, BellRing, ShieldCheck, UserRoundCheck, Beer, Soup, Building, Heater, ChefHat, AirVent } from 'lucide-react'
import Image from 'next/image'
import { Property, Review } from '@/types/property'
import { fetchProperty } from '@/lib/api/fetchProperty'
import { ReviewSection } from '@/components/ReviewSection'
import { BookingCard } from '@/components/BookingCard'
import ShowMap from '@/components/ShowMap'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { GalleryModal } from '@/components/GalleryModal'
import { Spinner } from '@/components/ui/spinner'

interface PropertyDetailsProps {
  property: Property;
}


export default function PropertyDetails() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [currentRoomImageIndex, setCurrentRoomImageIndex] = useState(0)
  const [currentRoomImageIndices, setCurrentRoomImageIndices] = useState<{ [key: string]: number }>({});

  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingType = searchParams.get('bookingType') || 'daily'
  const propertyId = Number(params.id)
  const checkInDateParam = searchParams.get('checkInDate')
  const checkOutDateParam = searchParams.get('checkOutDate')
  const checkInTimeParam = searchParams.get('checkInTime')
  const checkOutTimeParam = searchParams.get('checkOutTime')
  const selectedGuests = searchParams.get('guests')
  const selectedRooms = searchParams.get('rooms')

  const [property, setProperty] = useState<Property | null>(null)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryStartIndex, setGalleryStartIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [isMainImageLoaded, setIsMainImageLoaded] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(checkInDateParam ? new Date(checkInDateParam) : undefined)
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(checkOutDateParam ? new Date(checkOutDateParam) : undefined)
  const [checkInTime, setCheckInTime] = useState<string | null>(checkInTimeParam)
  const [checkOutTime, setCheckOutTime] = useState<string | null>(checkOutTimeParam)

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

  // Function to handle next room image
  const nextRoomImage = (roomId: string) => {
    setCurrentRoomImageIndices((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) + 1 % (property.rooms.find(room => room.id === roomId)?.images.length || 1),
    }));
  };

  // Function to handle previous room image
  const prevRoomImage = (roomId: string) => {
    setCurrentRoomImageIndices((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) - 1 < 0 ? (property.rooms.find(room => room.id === roomId)?.images.length || 1) - 1 : prev[roomId] - 1,
    }));
  };

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
                  fill={true}
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
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden ${index === currentImageIndex ? 'ring-2 ring-primary' : ''
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
                    <div className="flex space-x-4">
                      {/* Image Slider (Left Side) */}
                      <div className="w-1/3 relative">
                        {room.images && room.images.length > 0 ? (
                          <div className="relative w-full h-48 overflow-hidden rounded-lg mb-2">
                            <Image
                              src={room.images[currentRoomImageIndices[room.id] || 0]?.image}
                              alt={`Room Image ${currentRoomImageIndices[room.id] + 1}`}
                              fill={true}
                              className="object-cover"
                            />
                            {/* Navigation Arrows */}
                            <div className="absolute inset-0 flex items-center justify-between p-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                                onClick={() => prevRoomImage(room.id)}
                                disabled={(currentRoomImageIndices[room.id] || 0) === 0}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                                onClick={() => nextRoomImage(room.id)}
                                disabled={(currentRoomImageIndices[room.id] || 0) === room.images.length - 1}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-48 overflow-hidden rounded-lg mb-2 bg-gray-100 flex justify-center items-center">
                            <p className="text-gray-500">No images</p>
                          </div>
                        )}
                      </div>

                      {/* Room Details (Right Side) */}
                      <div className="w-2/3">
                        <div className="flex justify-between h-full flex-col">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">{'name' in room ? room.name : room.occupancyType}</h3>
                              <p className="text-gray-600 mb-2">{'size' in room ? `Room size: ${room.size} sq. ft` : `Available beds: ${room.availableBeds}/${room.totalBeds} sq. ft`}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 text-sm text-gray-700">
                              {room.bed_type && <div><span className="text-black-900 font-semibold">Bed Type:</span> <span className="text-gray-700">{room.bed_type}</span></div>}
                              {room.private_bathroom !== undefined && <div><span className="text-black-900 font-semibold">Private Bathroom:</span> <span className="text-gray-700">{room.private_bathroom ? 'Yes' : 'No'}</span></div>}
                              {room.smoking !== undefined && <div><span className="text-black-900 font-semibold">Smoking:</span> <span className="text-gray-700">{room.smoking ? 'Yes' : 'No'}</span></div>}
                            </div>
                          </div>
                          <div className="flex gap-2 mb-2">
                            {room.amenities.map((amenity, index) => {
                              const amenityIcons: { [key: string]: React.ReactNode } = {
                                "Security": <ShieldCheck className="h-5 w-5" />,
                                "Caretaker": <UserRoundCheck className="h-5 w-5" />,
                                "Reception": <BellRing className="h-5 w-5" />,
                                "Bar": < Beer className="h-5 w-5" />,
                                "Gym": <Dumbbell className="h-5 w-5" />,
                                "In-house Restaurant": <Soup className="h-5 w-5" />,
                                "Elevator": < Building className="h-5 w-5" />,
                                "Power backup": <BatteryCharging className="h-5 w-5" />,
                                "Geyser": <Heater className="h-5 w-5" />,
                                "Kitchen": <ChefHat className="h-5 w-5" />,
                                "Free Wifi": <Wifi className="h-5 w-5" />,
                                "AC": < AirVent className="h-5 w-5" />,
                                "TV": <Tv className="h-5 w-5" />,
                                "Coffee": <Coffee className="h-5 w-5" />,
                                "Utensils": <Utensils className="h-5 w-5" />,
                              }
                              const IconComponent = amenityIcons[(amenity.name as string)] || null

                              return (
                                <Badge key={index} variant="outline" className="flex items-center gap-1">
                                  {IconComponent}
                                  {amenity.name}
                                </Badge>
                              )
                            })}
                          </div>
                          <div className="mt-4">
                            <div className="flex flex-col items-end gap-1 text-sm text-gray-700">
                              {room.security_deposit !== undefined && <div>Security Deposit: {room.security ? 'Yes' : 'No'}</div>}
                            </div>
                          </div>
                          <div className="text-right mb-4">
                            <div className="text-2xl font-bold text-[#B11E43]">
                              ₹{(bookingType === 'hourly' ? parseFloat(room.hourly_rate) : parseFloat(room.daily_rate)) * (1 - (parseFloat(room.discount || '0') / 100)) }
                            </div>
                            <div className="text-gray-500 line-through">₹{bookingType === 'hourly' ? room.hourly_rate : room.daily_rate}</div>
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
              <ReviewSection reviews={property.reviews.slice(0, 2)} />
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
              bookingType={bookingType}
              property={property}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              checkInTime={checkInTime}
              checkOutTime={checkOutTime}
              selectedRoom={selectedRoom}
              selectedGuests={selectedGuests}
              selectedRooms={selectedRooms}
              searchParams={searchParams}
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