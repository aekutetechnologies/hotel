'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, ChevronLeft, ChevronRight, Wifi, Coffee, Tv, Car, Utensils, Building2, BatteryCharging, Dumbbell, BellRing, ShieldCheck, UserRoundCheck, Beer, Soup, Building, Heater, ChefHat, AirVent, ClipboardList, FileCheck, CheckCircle2 } from 'lucide-react'
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
  review: string;
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
  check_in_time?: string;
  check_out_time?: string;
  security_deposit?: number | string;
}

// Extend Room to include all necessary properties
interface ExtendedRoom extends Room {
  occupancyType?: string;
  availableBeds?: number;
  totalBeds?: number;
  security?: boolean;
  quantity?: number; // Add quantity field for tracking selected count
}

export default function PropertyDetails() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState<ExtendedRoom | null>(null)
  const [selectedRooms, setSelectedRooms] = useState<Map<string, ExtendedRoom>>(new Map())
  const [currentRoomImageIndex, setCurrentRoomImageIndex] = useState(0)
  const [currentRoomImageIndices, setCurrentRoomImageIndices] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);

  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Use try-catch block to handle any errors in parsing params
  let propertyId = 0;
  try {
    propertyId = Number(params.id);
    if (isNaN(propertyId)) {
      console.error("Invalid property ID:", params.id);
      propertyId = 0;
    }
  } catch (err) {
    console.error("Error parsing property ID:", err);
  }
  
  const bookingType = searchParams.get('bookingType') || 'daily'
  const checkInDateParam = searchParams.get('checkInDate')
  const checkOutDateParam = searchParams.get('checkOutDate')
  const checkInTimeParam = searchParams.get('checkInTime')
  const checkOutTimeParam = searchParams.get('checkOutTime')
  const monthsParam = searchParams.get('months')
  
  let selectedGuests = null;
  let selectedRoomsCount = null;
  let months = 1;
  
  try {
    selectedGuests = searchParams.get('guests') ? Number(searchParams.get('guests')) : null;
    selectedRoomsCount = searchParams.get('rooms') ? Number(searchParams.get('rooms')) : null;
    months = monthsParam ? Number(monthsParam) : 1;
  } catch (err) {
    console.error("Error parsing search params:", err);
  }

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

  // Handle URL query parameters for room selection
  useEffect(() => {
    if (property && property.rooms && selectedRoomsCount) {
      // If rooms count is specified in URL but no specific rooms are selected yet
      const totalSelected = Array.from(selectedRooms.values())
        .reduce((sum, room) => sum + (room.quantity || 0), 0);
        
      if (totalSelected === 0 && selectedRoomsCount > 0) {
        // Auto-select the first room with the count from URL
        setSelectedRooms(prevSelected => {
          const updatedRooms = new Map(prevSelected);
          // Find the first available room
          const firstRoom = property.rooms?.[0];
          if (firstRoom) {
            const roomId = firstRoom.id.toString();
            const currentRoom = updatedRooms.get(roomId);
            if (currentRoom) {
              updatedRooms.set(roomId, { 
                ...currentRoom, 
                quantity: selectedRoomsCount 
              });
            }
          }
          return updatedRooms;
        });
      }
    }
  }, [property, selectedRoomsCount, selectedRooms]);

  // Add global error handling for the component
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#B11E43] hover:bg-[#8f1836] text-white"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  // Wrap fetchProperty call in a try-catch block
  useEffect(() => {
    console.log("Fetching property with ID:", propertyId.toString());
    
    try {
      fetchProperty(propertyId.toString())
        .then((data) => {
          console.log("Property data loaded:", data);
          setProperty(data as ExtendedProperty);
          
          // Initialize room image indices
          if (data && data.rooms && data.rooms.length > 0) {
            // Create an initial state for the room image indices
            const initialIndices: { [key: string]: number } = {};
            let initialRoomSelections = new Map<string, ExtendedRoom>();
            
            // Try to restore saved room selections from session storage
            try {
              const savedSelectionsString = sessionStorage.getItem(`roomSelections_${propertyId}`);
              if (savedSelectionsString) {
                const savedSelections = JSON.parse(savedSelectionsString);
                
                // Convert the saved object back to a Map
                initialRoomSelections = new Map();
                data.rooms.forEach((room: any) => {
                  const roomId = room.id.toString();
                  initialIndices[roomId] = 0;
                  
                  // Create extended room with saved quantity if available
                  const savedQuantity = savedSelections[roomId] || 0;
                  initialRoomSelections.set(roomId, {
                    ...room,
                    quantity: savedQuantity
                  } as ExtendedRoom);
                });
              } else {
                // If no saved selections, initialize with zero quantities
                data.rooms.forEach((room: any) => {
                  initialIndices[room.id.toString()] = 0;
                  // Initialize each room with quantity 0
                  const extendedRoom = {...room, quantity: 0} as ExtendedRoom;
                  initialRoomSelections.set(room.id.toString(), extendedRoom);
                });
              }
            } catch (err) {
              console.error("Error restoring room selections:", err);
              // Fallback to zero quantities if error
              data.rooms.forEach((room: any) => {
                initialIndices[room.id.toString()] = 0;
                // Initialize each room with quantity 0
                const extendedRoom = {...room, quantity: 0} as ExtendedRoom;
                initialRoomSelections.set(room.id.toString(), extendedRoom);
              });
            }
            
            setCurrentRoomImageIndices(initialIndices);
            setSelectedRooms(initialRoomSelections);
            
            // Select the first room
            if (data.rooms.length > 0) {
              setSelectedRoom(data.rooms[0] as ExtendedRoom);
            }
          }
        })
        .catch(error => {
          console.error("Error fetching property:", error);
          setError("Failed to load property data. Please try again later.");
        });
    } catch (err) {
      console.error("Unexpected error in fetchProperty effect:", err);
      setError("An unexpected error occurred. Please try again later.");
    }
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
  const nextRoomImage = (roomId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setCurrentRoomImageIndices((prev) => {
      const currentIndex = prev[roomId] || 0;
      const roomImages = property?.rooms?.find(room => room.id.toString() === roomId)?.images || [];
      const maxIndex = roomImages.length - 1;
      
      // Calculate next index with boundary check
      const nextIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      
      return {
        ...prev,
        [roomId]: nextIndex
      };
    });
  };

  // Function to handle previous room image
  const prevRoomImage = (roomId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setCurrentRoomImageIndices((prev) => {
      const currentIndex = prev[roomId] || 0;
      const roomImages = property?.rooms?.find(room => room.id.toString() === roomId)?.images || [];
      const maxIndex = roomImages.length - 1;
      
      // Calculate previous index with boundary check
      const prevIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
      
      return {
        ...prev,
        [roomId]: prevIndex
      };
    });
  };

  // Function to handle room quantity changes
  const handleRoomQuantityChange = (roomId: string, increment: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setSelectedRooms(prevSelected => {
      const updatedRooms = new Map(prevSelected);
      const currentRoom = updatedRooms.get(roomId);
      
      if (currentRoom) {
        // Calculate new quantity with limits (0 minimum, 5 maximum)
        const currentQuantity = currentRoom.quantity || 0;
        const newQuantity = Math.max(0, Math.min(5, currentQuantity + increment));
        
        // Only proceed if there's an actual change
        if (newQuantity !== currentQuantity) {
          updatedRooms.set(roomId, { ...currentRoom, quantity: newQuantity });
          
          // Save updated selections to session storage
          const roomSelectionsObject: Record<string, number> = {};
          updatedRooms.forEach((room, id) => {
            roomSelectionsObject[id] = room.quantity || 0;
          });
          sessionStorage.setItem(`roomSelections_${propertyId}`, JSON.stringify(roomSelectionsObject));
          
          // Calculate change in total rooms for URL update
          const effectiveIncrement = newQuantity - currentQuantity;
          
          // Update the search params with the total selected rooms
          const updatedTotalRooms = Array.from(updatedRooms.values())
            .reduce((sum, room) => sum + (room.quantity || 0), 0);
          
          // Create new URLSearchParams object with current params
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.set('rooms', Math.max(1, updatedTotalRooms).toString());
          
          // Update the URL without reloading the page
          const url = new URL(window.location.href);
          url.search = newSearchParams.toString();
          window.history.pushState({}, '', url);
        }
      }
      
      return updatedRooms;
    });
  };

  // Calculate total selected rooms
  const totalSelectedRooms = Array.from(selectedRooms.values())
    .reduce((sum, room) => sum + (room.quantity || 0), 0);

  const isHostel = property.property_type === 'hostel'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <style jsx global>{`
          .scrollbar-hidden {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hidden::-webkit-scrollbar {
            display: none;
          }
          @media (max-width: 640px) {
            .container {
              padding-left: 1rem;
              padding-right: 1rem;
            }
            .property-section {
              margin-bottom: 2rem;
            }
          }
          .mobile-booking-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
            z-index: 40;
            padding: 0.75rem 1rem;
          }
          @media (min-width: 1024px) {
            .mobile-booking-bar {
              display: none;
            }
          }
        `}</style>

        {/* Mobile Booking Bar - Fixed at the bottom of screen on mobile only */}
        <div className="mobile-booking-bar flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-[#B11E43]">
                ₹{(() => {
                  // Find lowest priced room
                  if (!property.rooms || property.rooms.length === 0) return 0;
                  
                  const prices = property.rooms.map(room => {
                    if (isHostel && room.monthly_rate && parseFloat(room.monthly_rate) > 0) {
                      const basePrice = parseFloat(room.monthly_rate);
                      const discount = parseFloat(String(room.discount || '0'));
                      return basePrice * (1 - discount / 100);
                    } else {
                      const basePrice = bookingType === 'hourly' 
                        ? parseFloat(room.hourly_rate || '0') 
                        : parseFloat(room.daily_rate || '0');
                      const discount = parseFloat(String(room.discount || '0'));
                      return basePrice * (1 - discount / 100);
                    }
                  });
                  
                  return Math.min(...prices).toFixed(0);
                })()}
              </span>
              <span className="text-xs text-gray-500">
                {isHostel ? '/month' : bookingType === 'hourly' ? '/hour' : '/night'}
              </span>
            </div>
            {totalSelectedRooms > 0 && (
              <span className="text-xs text-gray-500">{totalSelectedRooms} room{totalSelectedRooms > 1 ? 's' : ''} selected</span>
            )}
          </div>
          <Button 
            onClick={() => document.querySelector('.lg\\:col-span-1')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#B11E43] hover:bg-[#8f1836] text-white"
          >
            View Booking Options
          </Button>
        </div>

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

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200 overflow-x-auto scrollbar-hidden">
          <div className="flex min-w-max">
            <button 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 sm:px-6 py-3 text-sm sm:text-base text-gray-800 font-medium border-b-2 border-[#B11E43] hover:bg-gray-50"
            >
              Overview
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('facilities')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 sm:px-6 py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 font-medium border-b-2 border-transparent hover:border-gray-300 hover:bg-gray-50"
            >
              Amenities
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('prices')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 sm:px-6 py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 font-medium border-b-2 border-transparent hover:border-gray-300 hover:bg-gray-50"
            >
              Info & prices
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 sm:px-6 py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 font-medium border-b-2 border-transparent hover:border-gray-300 hover:bg-gray-50"
            >
              Reviews ({property.reviews?.length || 0})
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('rules')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 sm:px-6 py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 font-medium border-b-2 border-transparent hover:border-gray-300 hover:bg-gray-50"
            >
              Rules
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="relative" id="overview">
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
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hidden">
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
            <section id="facilities">
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
                      className="flex items-center gap-2 p-3 sm:p-4 shadow-lg rounded-xl bg-white"
                    >
                      {IconComponent}
                      <span className="text-sm sm:text-base">{amenity.name || 'Unknown amenity'}</span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Room Types */}
            <section id="prices">
              <h2 className="text-2xl font-semibold mb-4">Available Rooms</h2>
              <div className="space-y-4">
                {property?.rooms?.map((room) => {
                  const roomId = room.id.toString();
                  const selectedRoom = selectedRooms.get(roomId);
                  const quantity = selectedRoom?.quantity || 0;
                  
                  return (
                    <div key={roomId} className="shadow-lg rounded-xl p-3 sm:p-4 bg-white">
                      <div className="flex flex-col sm:flex-row sm:space-x-4">
                        {/* Image Slider (Left Side - Full width on mobile, 1/3 on desktop) */}
                        <div className="w-full sm:w-1/3 relative mb-4 sm:mb-0">
                          {room.images && room.images.length > 0 ? (
                            <div className="relative w-full h-48 overflow-hidden rounded-lg mb-2">
                              <Image
                                src={room.images[currentRoomImageIndices[roomId] || 0]?.image || room.images[currentRoomImageIndices[roomId] || 0]?.image_url || '/placeholder.jpg'}
                                alt={`Room ${room.name || room.occupancyType} - Image ${(currentRoomImageIndices[roomId] || 0) + 1}`}
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
                                  onClick={(e) => prevRoomImage(roomId, e)}
                                  disabled={(currentRoomImageIndices[roomId] || 0) === 0}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="default"
                                  size="icon"
                                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-[#B11E43] hover:text-[#8f1836]"
                                  onClick={(e) => nextRoomImage(roomId, e)}
                                  disabled={(currentRoomImageIndices[roomId] || 0) === room.images.length - 1}
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

                        {/* Room Details (Right Side - Full width on mobile, 2/3 on desktop) */}
                        <div className="w-full sm:w-2/3">
                          <div className="flex flex-col justify-between h-full">
                            <div className="flex flex-col sm:flex-row sm:justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold mb-2">{'name' in room ? room.name : (room as ExtendedRoom).occupancyType}</h3>
                                <p className="text-gray-600 mb-2">{'size' in room ? `Room size: ${room.size} sq. ft` : `Available beds: ${(room as ExtendedRoom).availableBeds}/${(room as ExtendedRoom).totalBeds} sq. ft`}</p>
                                
                                {/* Room Amenities and Features */}
                                <div className="text-sm text-gray-700 mb-3">
                                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {room.bed_type && (
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        {room.bed_type}
                                      </div>
                                    )}
                                    {room.private_bathroom !== undefined && (
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        {room.private_bathroom ? 'Private bathroom' : 'Shared bathroom'}
                                      </div>
                                    )}
                                    {room.smoking !== undefined && (
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        {room.smoking ? 'Smoking allowed' : 'Non-smoking'}
                                      </div>
                                    )}
                                    {isHostel && room.security_deposit !== undefined && (
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        {room.security_deposit ? 'Security Deposit' : 'No Security Deposit'}
                                      </div>
                                    )}
                                    {room.amenities && room.amenities.length > 0 && room.amenities.slice(0, 6).map((amenity: CustomAmenity, index: number) => (
                                      <div key={`room-amenity-item-${amenity.id || index}`} className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        {amenity.name}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                              <div className="text-right mb-4 sm:mb-0">
                                <div className="text-2xl font-bold text-[#B11E43]">
                                  ₹{(() => {
                                    try {
                                      // Safely handle price calculations
                                      if (isHostel && room.monthly_rate && parseFloat(room.monthly_rate) > 0) {
                                        const basePrice = parseFloat(room.monthly_rate);
                                        const discount = parseFloat(String(room.discount || '0'));
                                        if (isNaN(basePrice) || isNaN(discount)) return 0;
                                        return (basePrice * (1 - discount / 100)).toFixed(0);
                                      } else {
                                        const basePrice = bookingType === 'hourly' 
                                          ? parseFloat(room.hourly_rate || '0') 
                                          : parseFloat(room.daily_rate || '0');
                                        const discount = parseFloat(String(room.discount || '0'));
                                        if (isNaN(basePrice) || isNaN(discount)) return 0;
                                        return (basePrice * (1 - discount / 100)).toFixed(0);
                                      }
                                    } catch (err) {
                                      console.error("Price calculation error:", err);
                                      return 0;
                                    }
                                  })()}
                                </div>
                                <div className="text-gray-500 line-through">
                                  ₹{(() => {
                                    try {
                                      if (isHostel && room.monthly_rate && parseFloat(room.monthly_rate) > 0) {
                                        return parseFloat(room.monthly_rate).toFixed(0);
                                      } else {
                                        return bookingType === 'hourly' 
                                          ? parseFloat(room.hourly_rate || '0').toFixed(0) 
                                          : parseFloat(room.daily_rate || '0').toFixed(0);
                                      }
                                    } catch (err) {
                                      console.error("Original price calculation error:", err);
                                      return 0;
                                    }
                                  })()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {isHostel && room.monthly_rate && parseFloat(room.monthly_rate) > 0 
                                    ? 'per month' 
                                    : bookingType === 'hourly' ? 'per hour' : 'per night'
                                  }
                                </div>
                              </div>
                              <div className="flex items-center justify-end">
                                <Button
                                  onClick={(e) => handleRoomQuantityChange(roomId, -1, e)}
                                  variant="neutral" 
                                  size="icon"
                                  className="h-8 w-8"
                                  disabled={quantity <= 0}
                                >
                                  -
                                </Button>
                                <span className="mx-3 font-medium">{quantity}</span>
                                <Button
                                  onClick={(e) => handleRoomQuantityChange(roomId, 1, e)}
                                  variant="neutral"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* About */}
            <section className="property-section">
              <h2 className="text-2xl font-semibold mb-4">About this property</h2>
              <p className="text-gray-700">{property.description}</p>
            </section>

            {/* Map Section */}
            {!showGallery && (
              <section className="property-section">
                <h2 className="text-2xl font-semibold mb-4">Location</h2>
                {property.latitude && property.longitude && (
                  <div className="h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden">
                    <ShowMap
                      latitude={parseFloat(property.latitude)}
                      longitude={parseFloat(property.longitude)}
                    />
                  </div>
                )}
              </section>
            )}

            {/* Reviews */}
            <section id="reviews" className="property-section">
              <h2 className="text-2xl font-semibold mb-4">Ratings and reviews</h2>
              <ReviewSection reviews={property.reviews || []} />
            </section>

            {/* Policies */}
            <section id="rules" className="property-section">
              <h2 className="text-2xl font-semibold mb-4">House Rules & Policies</h2>
              <div className="space-y-4">
                <div className="p-4 sm:p-6 bg-white shadow-lg rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">Rules & Policies</h3>
                  <ul className="space-y-2">
                      {property.rules.map((rule, index) => (
                      <li key={rule.id || `rule-${index}`} className="flex items-start">
                        <ClipboardList className="h-5 w-5 mr-2 text-[#B11E43] flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base">{rule.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 sm:p-6 bg-white shadow-lg rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">Documentation Required</h3>
                  <ul className="space-y-2">
                      {property.documentation.map((doc, index) => (
                      <li key={doc.id || `doc-${index}`} className="flex items-start">
                        <FileCheck className="h-5 w-5 mr-2 text-[#B11E43] flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base">{doc.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Fine Print Section */}
            <section id="fine-print" className="property-section">
              <h2 className="text-2xl font-semibold mb-4">The fine print</h2>
              <div className="p-4 sm:p-6 bg-white shadow-lg rounded-xl">
                <p className="text-gray-700 mb-4">Important information about your booking:</p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <ClipboardList className="h-5 w-5 mr-2 text-[#B11E43] flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Check-in time starts at {property.check_in_time || '2:00 PM'}</span>
                  </li>
                  <li className="flex items-start">
                    <ClipboardList className="h-5 w-5 mr-2 text-[#B11E43] flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Check-out time is {property.check_out_time || '12:00 PM'}</span>
                  </li>
                  <li className="flex items-start">
                    <ClipboardList className="h-5 w-5 mr-2 text-[#B11E43] flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Front desk staff will greet guests on arrival</span>
                  </li>
                  {property.property_type === 'hotel' && (
                    <li className="flex items-start">
                      <ClipboardList className="h-5 w-5 mr-2 text-[#B11E43] flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base">24-hour front desk service available</span>
                    </li>
                  )}
                  {property.security_deposit && (
                    <li className="flex items-start">
                      <ClipboardList className="h-5 w-5 mr-2 text-[#B11E43] flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base">Security deposit of ₹{property.security_deposit} required at check-in</span>
                    </li>
                  )}
                  <li className="flex items-start">
                    <ClipboardList className="h-5 w-5 mr-2 text-[#B11E43] flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Pets are not allowed on the property</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4 w-full">
              <BookingCard
                bookingType={bookingType}
                property={property}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                checkInTime={checkInTime}
                checkOutTime={checkOutTime}
                months={months}
                selectedRoomMap={selectedRooms}
                selectedGuests={selectedGuests}
                selectedRoomsCount={totalSelectedRooms}
                searchParams={searchParams}
              />
            </div>
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
  );
}