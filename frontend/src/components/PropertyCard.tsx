'use client'

import { Property, Review } from '@/types/property'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Coffee, ShieldCheck, UserRoundCheck, BellRing, Beer, Soup, Building, BatteryCharging, Heater, ChefHat, AirVent, Tv, Utensils, StarHalf, Heart } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ApiButton } from "@/components/ui/api-button"
import { useApiRequest } from "@/hooks/useApiRequest"
import { toast } from 'react-toastify'
import { toggleFavourite } from '@/lib/api/toggleFavourite'

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
  const originalPrice = property.rooms && property.rooms.length > 0 ? 
    Math.min(...property.rooms.map(room => {
      if (isHostel && room.monthly_rate && parseFloat(room.monthly_rate) > 0) {
        return parseFloat(room.monthly_rate);
      } else {
        return parseFloat(room.daily_rate || room.price || '0');
      }
    })) :
    0;
  
  const discount = property.rooms && property.rooms.length > 0 ? 
    Math.max(...property.rooms.map(room => parseFloat(room.discount || '0'))) : 
    0;
  
  // Calculate the sale price after applying the discount
  const salePrice = originalPrice * (1 - discount / 100);
  
  // Count available rooms
  const availableRoomsCount = property.rooms && property.rooms.length > 0 ?
    property.rooms.filter(room => room.is_available !== false).length :
    0;

  // Calculate the appropriate price label based on property type and booking type
  const getPriceLabel = () => {
    if (isHostel) {
      // Check if we're using monthly rate
      if (property.rooms && property.rooms.some(room => room.monthly_rate && parseFloat(room.monthly_rate) > 0)) {
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
  const [isFavorite, setIsFavorite] = useState('is_favorite' in property ? !!property.is_favorite : false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  const toggleFavoriteStatus = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in (access token exists)
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      toast.info('Please log in to save favorites', {
        style: { background: '#E0F2FE', color: '#0369A1', borderLeft: '4px solid #0EA5E9' }
      });
      return;
    }
    
    if (isUpdatingFavorite) return; // Prevent multiple clicks
    setIsUpdatingFavorite(true);
    
    const newFavoriteStatus = !isFavorite;
    
    try {
      // Optimistically update UI
      setIsFavorite(newFavoriteStatus);
      
      // Call backend API
      await toggleFavourite(property.id.toString(), newFavoriteStatus);
      
      // Show success message
      if (newFavoriteStatus) {
        toast.success('Added to favorites', {
          style: { background: '#FFEAEF', color: '#B11E43', borderLeft: '4px solid #B11E43' }
        });
      } else {
        toast.info('Removed from favorites', {
          style: { background: '#F5F5F5', color: '#666', borderLeft: '4px solid #999' }
        });
      }
    } catch (error) {
      // Revert UI state in case of error
      setIsFavorite(!newFavoriteStatus);
      
      // Show error message
      toast.error('Failed to update favorite status. Please try again.', {
        style: { background: '#FEE2E2', color: '#B91C1C', borderLeft: '4px solid #B91C1C' }
      });
      console.error('Error toggling favorite:', error);
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  // Calculate actual rating from property reviews
  const hasReviews = property.reviews && Array.isArray(property.reviews) && property.reviews.length > 0
  const averageRating = hasReviews && property.reviews 
    ? property.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / property.reviews.length 
    : 0
  const reviewCount = hasReviews && property.reviews ? property.reviews.length : 0
  const displayRating = averageRating > 0 ? averageRating.toFixed(1) : "New"

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:border-[#B11E43] transition-colors duration-300">
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
              className="absolute top-2 left-2 bg-white/80 text-[#B11E43] border border-[#B11E43]"
            >
              {property.property_type.toUpperCase()}
            </Badge>
            
            {/* Favorite Button */}
            <button
              onClick={toggleFavoriteStatus}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200 shadow-sm transform active:scale-90 active:rotate-12 transition-transform"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              disabled={isUpdatingFavorite}
            >
              <Heart 
                className={`h-5 w-5 transition-all duration-300 ${
                  isFavorite 
                    ? "text-[#B11E43] fill-[#B11E43] transform scale-110" 
                    : "text-gray-400 hover:text-[#B11E43]"
                } ${isUpdatingFavorite ? "opacity-80 animate-pulse" : "opacity-100"}`} 
              />
            </button>
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
                    <MapPin className="w-4 h-4 mr-1 text-[#B11E43]" />
                    {property.area && property.city ? `${property.area}, ${property.city.name}` : property.location}
                  </p>
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
                  <Badge key={index} variant="outline" className="text-xs flex items-center gap-1 border-gray-200">
                    {Icon && <Icon className="w-3 h-3 text-[#B11E43]" />}
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-grow">
                  <p className="text-xs sm:text-sm text-gray-500">Starting from</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold">₹{salePrice}</span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {getPriceLabel()}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        ₹{originalPrice}
                      </span>
                      <Badge variant="secondary" className="text-xs bg-[#FFEAEF] text-[#B11E43] border border-[#FFDCE6]">
                        {discount}% OFF
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Rating badge */}
                <div className="bg-gray-50 px-3 py-1 rounded-full flex items-center shadow-sm border border-gray-100 self-center">
                  {hasReviews ? (
                    <>
                      <Star className="w-4 h-4 text-[#B11E43] fill-[#B11E43] mr-1" />
                      <span className="text-md font-medium mr-1">{displayRating}</span>
                      <span className="text-xs text-gray-500">({reviewCount})</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500 flex items-center">
                      <StarHalf className="w-4 h-4 mr-1 text-[#B11E43]" />
                      New
                    </span>
                  )}
                </div>

                <div className="flex flex-row gap-2 justify-end sm:justify-start">
                  <Link href={{
                    pathname: `/property/${property.id}`,
                    query: searchParams? Object.fromEntries(searchParams.entries()) : {}
                  }}
                  target="_blank"
                  rel="noopener noreferrer">
                    <Button variant="default" size="sm" className="whitespace-nowrap bg-[#B11E43] hover:bg-[#8f1836]">
                      View Details
                    </Button>
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
