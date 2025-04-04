'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, ChevronLeft, ChevronRight, Wifi, Coffee, Tv, Car, Utensils, Building2, BatteryCharging, Dumbbell, BellRing, ShieldCheck, UserRoundCheck, Beer, Soup, Building, Heater, ChefHat, AirVent, ClipboardList, FileCheck } from 'lucide-react'
import Image from 'next/image'
import { Property, Room } from '@/types/property'
import { fetchProperty } from '@/lib/api/fetchProperty'
import { ReviewSection } from '@/components/ReviewSection'
import { BookingCard } from '@/components/BookingCard'
import ShowMap from '@/components/ShowMap'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { GalleryModal } from '@/components/GalleryModal'
import { Spinner } from '@/components/ui/spinner'
import { LoadingIndicator } from '@/components/ui/LoadingIndicator'

interface PropertyDetailsProps {
  property: Property;
}

// Add review interface
interface Review {
  id: number;
  user: {
    name: string;
  };
  rating: number;
  detail: string;
  created_at: string;
  images: string[];
}

// Define custom Amenity interface matching the one used in components
interface CustomAmenity {
  id: string | number;
  name: string;
}

// Define rule interface to match API response
interface Rule {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Define documentation interface to match API response
interface Documentation {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Add reviews to Property interface
interface ExtendedProperty extends Property {
  reviews: Review[];
  rules: Rule[];
  documentation: Documentation[];
}

// Extend Room to include all necessary properties
interface ExtendedRoom extends Room {
  occupancyType?: string;
  availableBeds?: number;
  totalBeds?: number;
  security?: boolean;
}

export default function PropertyDetails() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState<ExtendedRoom | null>(null)
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
  const selectedGuests = searchParams.get('guests') ? Number(searchParams.get('guests')) : null
  const selectedRooms = searchParams.get('rooms') ? Number(searchParams.get('rooms')) : null

  const [property, setProperty] = useState<ExtendedProperty | null>(null)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryStartIndex, setGalleryStartIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [isMainImageLoaded, setIsMainImageLoaded] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(checkInDateParam ? new Date(checkInDateParam) : undefined)
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(checkOutDateParam ? new Date(checkOutDateParam) : undefined)
  const [checkInTime, setCheckInTime] = useState<string | null>(checkInTimeParam)
  const [checkOutTime, setCheckOutTime] = useState<string | null>(checkOutTimeParam)

  // Log time values for debugging
  useEffect(() => {
    console.log("Page time values:", {
      checkInTimeParam,
      checkOutTimeParam,
      checkInTime,
      checkOutTime,
      bookingType
    });
  }, [checkInTimeParam, checkOutTimeParam, checkInTime, checkOutTime, bookingType]);

  // Format time values to ensure they're in HH:00 format if needed
  useEffect(() => {
    if (bookingType === 'hourly') {
      // If we have time params but they don't include minutes, add ":00"
      if (checkInTimeParam && !checkInTimeParam.includes(':')) {
        setCheckInTime(`${checkInTimeParam}:00`);
      }
      
      if (checkOutTimeParam && !checkOutTimeParam.includes(':')) {
        setCheckOutTime(`${checkOutTimeParam}:00`);
      }
      
      // If we don't have time params, set defaults
      if (!checkInTimeParam) {
        const now = new Date();
        const nextHour = (now.getHours() + 1) % 24;
        setCheckInTime(`${nextHour}:00`);
      }
      
      if (!checkOutTimeParam) {
        if (checkInTimeParam) {
          const hour = parseInt(checkInTimeParam);
          const nextHour = (hour + 2) % 24;
          setCheckOutTime(`${nextHour}:00`);
        } else {
          const now = new Date();
          const laterHour = (now.getHours() + 3) % 24;
          setCheckOutTime(`${laterHour}:00`);
        }
      }
    }
  }, [bookingType, checkInTimeParam, checkOutTimeParam]);

  useEffect(() => {
    console.log("Fetching property with ID:", propertyId.toString());
    
    fetchProperty(propertyId.toString())
      .then((data) => {
        console.log("Property data loaded:", data);
        setProperty(data as ExtendedProperty);
        
        // Initialize room image indices
        if (data && data.rooms && data.rooms.length > 0) {
          // Create an initial state for the room image indices
          const initialIndices: { [key: string]: number } = {};
          data.rooms.forEach((room: any) => {
            initialIndices[room.id.toString()] = 0;
          });
          setCurrentRoomImageIndices(initialIndices);
          
          // Select the first room
          setSelectedRoom(data.rooms[0] as ExtendedRoom);
        }
      })
      .catch(error => {
        console.error("Error fetching property:", error);
      });
  }, [propertyId]);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIndicator 
          variant="dots" 
          size="md" 
          text="Loading property details..." 
        />
      </div>
    );
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
      [roomId]: (prev[roomId] || 0) + 1 % (property?.rooms?.find(room => room.id.toString() === roomId)?.images?.length || 1),
    }));
  };

  // Function to handle previous room image
  const prevRoomImage = (roomId: string) => {
    setCurrentRoomImageIndices((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) - 1 < 0 
        ? (property?.rooms?.find(room => room.id.toString() === roomId)?.images?.length || 1) - 1 
        : prev[roomId] - 1,
    }));
  };

  const isHostel = property.property_type === 'hostel'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Property Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{property.name}</h1>
          <p className="text-gray-600 flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-[#B11E43]" />
            {property.area && property.city ? `${property.area}, ${property.city.name}` : property.location}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2 border-[#B11E43] text-[#B11E43]">
              <Building2 className="h-4 w-4 text-[#B11E43]" />
              {property.property_type === 'hotel' ? 'Hotel' : property.property_type === 'hostel' ? 'Hostel' : 'Property'}
            </Badge>
            {property.discount && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {property.discount}% OFF
            </Badge>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 border-[#B11E43]">
                <Star className="h-4 w-4 text-[#B11E43] fill-current mr-1" />
                {property.reviews && property.reviews.length > 0 
                  ? (property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length).toFixed(1) 
                  : 'New'}
              </Badge>
              <span className="text-sm text-gray-600">
                {property.reviews && property.reviews.length > 0 
                  ? `${property.reviews.length} ${property.reviews.length === 1 ? 'review' : 'reviews'}` 
                  : 'No reviews yet'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative">
              {/* Main image */}
              <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-t-xl overflow-hidden">
                <Image
                  src={property.images[currentImageIndex]?.image || '/placeholder-property.jpg'}
                  alt={`${property.name} - featured image`}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                <div className="absolute bottom-4 right-4 flex space-x-2">
                <Button
                  size="icon"
                    variant="default"
                    onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : property.images.length - 1))}
                    className="h-8 w-8 rounded-full bg-white/80 text-[#B11E43] hover:bg-white hover:text-[#8f1836]"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                    variant="default"
                    onClick={() => setCurrentImageIndex(prev => (prev < property.images.length - 1 ? prev + 1 : 0))}
                    className="h-8 w-8 rounded-full bg-white/80 text-[#B11E43] hover:bg-white hover:text-[#8f1836]"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                </div>
              </div>
              
              {/* Image thumbnails */}
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                {property.images.map((image, index) => (
                  <button
                    key={`image-thumbnail-${image.id || index}`}
                    className={`relative w-20 h-16 rounded-md overflow-hidden transition-all ${
                      currentImageIndex === index ? 'ring-2 ring-primary' : 'opacity-80'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={image.image || image.image_url || '/placeholder.jpg'}
                      alt={`${property.name} - image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                {property.amenities.map((amenity, index) => {
                  const amenityIcons: { [key: string]: React.ReactNode } = {
                    "Security": <ShieldCheck className="h-5 w-5 text-[#B11E43]" />,
                    "Caretaker": <UserRoundCheck className="h-5 w-5 text-[#B11E43]" />,
                    "Reception": <BellRing className="h-5 w-5 text-[#B11E43]" />,
                    "Bar": <Beer className="h-5 w-5 text-[#B11E43]" />,
                    "Gym": <Dumbbell className="h-5 w-5 text-[#B11E43]" />,
                    "In-house Restaurant": <Soup className="h-5 w-5 text-[#B11E43]" />,
                    "Elevator": <Building className="h-5 w-5 text-[#B11E43]" />,
                    "Power backup": <BatteryCharging className="h-5 w-5 text-[#B11E43]" />,
                    "Geyser": <Heater className="h-5 w-5 text-[#B11E43]" />,
                    "Kitchen": <ChefHat className="h-5 w-5 text-[#B11E43]" />,
                    "Free Wifi": <Wifi className="h-5 w-5 text-[#B11E43]" />,
                    "AC": <AirVent className="h-5 w-5 text-[#B11E43]" />,
                    "TV": <Tv className="h-5 w-5 text-[#B11E43]" />,
                    "Coffee": <Coffee className="h-5 w-5 text-[#B11E43]" />,
                    "Utensils": <Utensils className="h-5 w-5 text-[#B11E43]" />,
                  }
                  const IconComponent = amenityIcons[(amenity.name as string)] || null

                  // Create a guaranteed unique key
                  const amenityKey = amenity.id 
                    ? `amenity-id-${amenity.id}` 
                    : amenity.name 
                      ? `amenity-name-${amenity.name}` 
                      : `amenity-index-${index}`;

                  return (
                    <div 
                      key={amenityKey} 
                      className="flex items-center gap-2 p-4 border rounded-lg"
                    >
                      {IconComponent}
                      <span>{amenity.name || 'Unknown amenity'}</span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Room Types */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Available Rooms</h2>
              <div className="space-y-4">
                {property?.rooms?.map((room) => (
                  <div key={room.id} className="border rounded-lg p-4">
                    <div className="flex space-x-4">
                      {/* Image Slider (Left Side) */}
                      <div className="w-1/3 relative">
                        {room.images && room.images.length > 0 ? (
                          <div className="relative w-full h-48 overflow-hidden rounded-lg mb-2">
                            <Image
                              src={room.images[currentRoomImageIndices[room.id.toString()] || 0]?.image || room.images[currentRoomImageIndices[room.id.toString()] || 0]?.image_url || '/placeholder.jpg'}
                              alt={`Room ${room.name || room.occupancyType} - Image ${(currentRoomImageIndices[room.id.toString()] || 0) + 1}`}
                              fill
                              className="object-cover"
                              priority
                            />
                            {/* Navigation Arrows */}
                            <div className="absolute inset-0 flex items-center justify-between p-2">
                              <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-[#B11E43] hover:text-[#8f1836]"
                                onClick={() => prevRoomImage(room.id.toString())}
                                disabled={(currentRoomImageIndices[room.id] || 0) === 0}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-[#B11E43] hover:text-[#8f1836]"
                                onClick={() => nextRoomImage(room.id.toString())}
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
                              <h3 className="text-xl font-semibold mb-2">{'name' in room ? room.name : (room as ExtendedRoom).occupancyType}</h3>
                              <p className="text-gray-600 mb-2">{'size' in room ? `Room size: ${room.size} sq. ft` : `Available beds: ${(room as ExtendedRoom).availableBeds}/${(room as ExtendedRoom).totalBeds} sq. ft`}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 text-sm text-gray-700">
                              {room.bed_type && <div><span className="text-black-900 font-semibold">Bed Type:</span> <span className="text-gray-700">{room.bed_type}</span></div>}
                              {room.private_bathroom !== undefined && <div><span className="text-black-900 font-semibold">Private Bathroom:</span> <span className="text-gray-700">{room.private_bathroom ? 'Yes' : 'No'}</span></div>}
                              {room.smoking !== undefined && <div><span className="text-black-900 font-semibold">Smoking:</span> <span className="text-gray-700">{room.smoking ? 'Yes' : 'No'}</span></div>}
                            </div>
                          </div>
                          <div className="flex gap-2 mb-2">
                            {room.amenities && room.amenities.map((amenity: CustomAmenity, index: number) => {
                              const amenityIcons: { [key: string]: React.ReactNode } = {
                                "Security": <ShieldCheck className="h-5 w-5 text-[#B11E43]" />,
                                "Caretaker": <UserRoundCheck className="h-5 w-5 text-[#B11E43]" />,
                                "Reception": <BellRing className="h-5 w-5 text-[#B11E43]" />,
                                "Bar": <Beer className="h-5 w-5 text-[#B11E43]" />,
                                "Gym": <Dumbbell className="h-5 w-5 text-[#B11E43]" />,
                                "In-house Restaurant": <Soup className="h-5 w-5 text-[#B11E43]" />,
                                "Elevator": <Building className="h-5 w-5 text-[#B11E43]" />,
                                "Power backup": <BatteryCharging className="h-5 w-5 text-[#B11E43]" />,
                                "Geyser": <Heater className="h-5 w-5 text-[#B11E43]" />,
                                "Kitchen": <ChefHat className="h-5 w-5 text-[#B11E43]" />,
                                "Free Wifi": <Wifi className="h-5 w-5 text-[#B11E43]" />,
                                "AC": <AirVent className="h-5 w-5 text-[#B11E43]" />,
                                "TV": <Tv className="h-5 w-5 text-[#B11E43]" />,
                                "Coffee": <Coffee className="h-5 w-5 text-[#B11E43]" />,
                                "Utensils": <Utensils className="h-5 w-5 text-[#B11E43]" />,
                              }
                              const IconComponent = amenityIcons[amenity.name] || null

                              // Create a guaranteed unique key
                              const roomAmenityKey = amenity.id 
                                ? `room-${room.id}-amenity-id-${amenity.id}` 
                                : amenity.name 
                                  ? `room-${room.id}-amenity-name-${amenity.name}` 
                                  : `room-${room.id}-amenity-index-${index}`;

                              return (
                                <Badge 
                                  key={roomAmenityKey}
                                  variant="outline" 
                                  className="flex items-center gap-1"
                                >
                                  {IconComponent}
                                  {amenity.name || 'Unknown amenity'}
                                </Badge>
                              )
                            })}
                          </div>
                          <div className="mt-4">
                            <div className="flex flex-col items-end gap-1 text-sm text-gray-700">
                              {room.security_deposit !== undefined && <div>Security Deposit: {(room as ExtendedRoom).security ? 'Yes' : 'No'}</div>}
                            </div>
                          </div>
                          <div className="text-right mb-4">
                            <div className="text-2xl font-bold text-[#B11E43]">
                              ₹{isHostel && room.monthly_rate && parseFloat(room.monthly_rate) > 0 
                                ? parseFloat(room.monthly_rate) * (1 - (parseFloat(String(room.discount || '0')) / 100))
                                : (bookingType === 'hourly' ? parseFloat(room.hourly_rate) : parseFloat(room.daily_rate)) * (1 - (parseFloat(String(room.discount || '0')) / 100)) 
                              }
                            </div>
                            <div className="text-gray-500 line-through">
                              ₹{isHostel && room.monthly_rate && parseFloat(room.monthly_rate) > 0 
                                ? room.monthly_rate 
                                : bookingType === 'hourly' ? room.hourly_rate : room.daily_rate
                              }
                            </div>
                            <div className="text-xs text-gray-500">
                              {isHostel && room.monthly_rate && parseFloat(room.monthly_rate) > 0 
                                ? 'per month' 
                                : bookingType === 'hourly' ? 'per hour' : 'per night'
                              }
                            </div>
                            <Button
                              onClick={() => setSelectedRoom(room as ExtendedRoom)}
                              variant={selectedRoom?.id === room.id ? "default" : "neutral"}
                              className={selectedRoom?.id === room.id ? "bg-[#B11E43] hover:bg-[#8f1836]" : ""}
                            >
                              {selectedRoom?.id === room.id ? "Selected" : "Select"}
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
              <ReviewSection reviews={property.reviews || []} />
            </section>

            {/* Policies */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">House Rules & Policies</h2>
              <div className="space-y-4">
                <div className="p-6 bg-white shadow-lg rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">Rules & Policies</h3>
                  <ul className="space-y-2">
                      {property.rules.map((rule, index) => (
                      <li key={rule.id || `rule-${index}`} className="flex items-start">
                        <ClipboardList className="h-5 w-5 mr-2 text-[#B11E43]" />
                        <span>{rule.name}</span>
                      </li>
                      ))}
                  </ul>
                </div>
                
                <div className="p-6 bg-white shadow-lg rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">Documentation Required</h3>
                  <ul className="space-y-2">
                      {property.documentation.map((doc, index) => (
                      <li key={doc.id || `doc-${index}`} className="flex items-start">
                        <FileCheck className="h-5 w-5 mr-2 text-[#B11E43]" />
                        <span>{doc.name}</span>
                      </li>
                      ))}
                  </ul>
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
              selectedRoom={selectedRoom as any}
              selectedGuests={selectedGuests}
              selectedRooms={selectedRooms}
              searchParams={searchParams}
            />
          </div>
        </div>
      </main>
      <Footer sectionType="hotels" />

      {showGallery && (
        <GalleryModal
          images={property.images.map(img => ({
            id: img.id,
            image: img.image || img.image_url || '/placeholder.jpg'
          }))}
          initialIndex={currentImageIndex}
          onClose={closeGalleryModal}
        />
      )}
    </div>
  )
}