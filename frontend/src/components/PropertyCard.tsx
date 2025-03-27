'use client'

import { Property, Review } from '@/types/property'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Coffee, ShieldCheck, UserRoundCheck, BellRing, Beer, Soup, Building, BatteryCharging, Heater, ChefHat, AirVent, Tv, Utensils, StarHalf } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ApiButton } from "@/components/ui/api-button"
import { useApiRequest } from "@/hooks/useApiRequest"
import { toast } from 'react-toastify'

interface PropertyCardProps {
  property: Property;
  searchParams: ReturnType<typeof useSearchParams>;
}

const amenityIcons = {
  "Free Wifi": Wifi,
  "Free WiFi": Wifi,
  "Coffee": Coffee,
  "Security": ShieldCheck,
  "Caretaker": UserRoundCheck,
  "Reception": BellRing,
  "Bar": Beer,
  "In-house Restaurant": Soup,
  "Elevator": Building,
  "Power backup": BatteryCharging,
  "Geyser": Heater,
  "Kitchen": ChefHat,
  "AC": AirVent,
  "TV": Tv,
  "Utensils": Utensils,
}

export function PropertyCard({ property, searchParams }: PropertyCardProps) {
  const isHostel = property.property_type === 'hostel'
  const bookingType = searchParams.get('bookingType') || 'daily'
  
  // For hostels, use monthly rates when available
  const originalPrice = Math.min(...property.rooms.map(room => {
    if (isHostel && room.monthly_rate && parseFloat(room.monthly_rate) > 0) {
      return parseFloat(room.monthly_rate);
    } else {
      return bookingType === 'hourly' ? parseFloat(room.hourly_rate) : parseFloat(room.daily_rate);
    }
  }));
  
  const discount = Math.max(...property.rooms.map(room => room.discount || 0))
  const lowestPrice = originalPrice - (originalPrice * (discount || 0)) / 100

  // Calculate the appropriate price label based on property type and booking type
  const getPriceLabel = () => {
    if (isHostel) {
      // Check if we're using monthly rate
      if (property.rooms.some(room => room.monthly_rate && parseFloat(room.monthly_rate) > 0)) {
        return '/month';
      } else {
        return bookingType === 'hourly' ? '/hour' : '/night';
      }
    } else {
      return bookingType === 'hourly' ? '/hour' : '/night';
    }
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  // Calculate actual rating from property reviews
  const hasReviews = property.reviews && Array.isArray(property.reviews) && property.reviews.length > 0
  const averageRating = hasReviews && property.reviews 
    ? property.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / property.reviews.length 
    : 0
  const reviewCount = hasReviews && property.reviews ? property.reviews.length : 0
  const displayRating = averageRating > 0 ? averageRating.toFixed(1) : "New"

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="w-full sm:w-2/5 relative flex pr-0">
          <div className="relative h-48 w-48 sm:h-52 sm:w-52 md:h-60 md:w-60 lg:h-64 lg:w-64 xl:h-72 xl:w-72 flex-1">
            <img
              src={property.images[currentImageIndex].image}
              alt={property.name}
              className="object-cover w-full h-full p-2"
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageLoaded(true)}
              style={{ opacity: isImageLoaded ? 1 : 0 }}
            />
            <Badge
              variant="secondary"
              className="absolute top-2 left-2"
            >
              {property.property_type.toUpperCase()}
            </Badge>
          </div>
          {property.images.length > 1 && (
            <div className="flex flex-col w-24 p-2 space-y-1">
              {property.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className={`relative h-19 w-full rounded-md overflow-hidden cursor-pointer border-2 ${index === currentImageIndex ? 'border-[#B11E43]' : 'border-transparent'} mr-0`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img
                    src={image.image}
                    alt={`${property.name} thumbnail ${index + 1}`}
                    className="object-fill w-full h-full"
                    onLoad={() => setIsImageLoaded(true)}
                    onError={() => setIsImageLoaded(true)}
                    style={{ opacity: isImageLoaded ? 1 : 0 }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-2 sm:p-4">
          <div className="flex flex-col h-full">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <Link 
                    href={{
                      pathname: `/property/${property.id}`,
                      query: searchParams ? Object.fromEntries(searchParams.entries()) : {}
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <h2 className="text-xl sm:text-2xl font-semibold mb-1">{property.name}</h2>
                  </Link>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.area && property.city ? `${property.area}, ${property.city.name}` : property.location}
                  </p>
                </div>
                <div className="flex items-center">
                  {hasReviews ? (
                    <>
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="text-lg font-medium">{displayRating}</span>
                      <span className="text-xs text-gray-500 ml-1">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">No reviews yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="flex flex-wrap gap-2 mb-2">
              {property.amenities.slice(0, 5).map((amenity, index) => {
                // Type assertion to ensure amenity.name is a valid key
                const amenityName = amenity.name as keyof typeof amenityIcons;
                const Icon = amenityIcons[amenityName] || Wifi;
                return (
                  <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                    {Icon && <Icon className="w-3 h-3" />}
                    {amenity.name}
                  </Badge>
                )
              })}
              {property.amenities.length > 5 && (
                <Badge variant="outline" className="text-xs">+{property.amenities.length - 5} more</Badge>
              )}
            </div>

            {/* Pricing Section */}
            <div className="mt-auto">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Starting from</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold">₹{lowestPrice}</span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {getPriceLabel()}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        ₹{originalPrice}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {discount}% OFF
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href={{
                    pathname: `/property/${property.id}`,
                    query: searchParams? Object.fromEntries(searchParams.entries()) : {}
                  }}
                  target="_blank"
                  rel="noopener noreferrer">
                    <Button variant="neutral" size="lg">
                      View Details
                    </Button>
                  </Link>
                  <Link href={{
                    pathname: `/property/${property.id}/book`,
                    query: searchParams? Object.fromEntries(searchParams.entries()) : {}
                  }}
                  target="_blank"
                  rel="noopener noreferrer">
                    <ApiButton
                      className="bg-[#B11E43] hover:bg-[#8f1836]"
                      size="lg"
                      loadingText="Preparing..."
                      onClick={async () => {
                        // This simulates any pre-booking API call, like checking availability
                        // Even with multiple rapid clicks, this will only execute once
                        await new Promise(resolve => setTimeout(resolve, 500));
                        return true;
                      }}
                    >
                      Book Now
                    </ApiButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
