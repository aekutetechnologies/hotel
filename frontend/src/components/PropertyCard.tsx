'use client'

import { Property } from '@/types/property'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Coffee, Gym, Parking, Pet, Spa, ShieldCheck, UserRoundCheck, BellRing, Beer, Soup, Building, BatteryCharging, Heater, ChefHat, AirVent, Tv, Utensils, StarHalf } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface PropertyCardProps {
  property: Property;
}

const amenityIcons = {
  "Free WiFi": Wifi,
  "Coffee": Coffee,
  "Gym": Gym,
  "Parking": Parking,
  "Spa": Spa,
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

export function PropertyCard({ property }: PropertyCardProps) {
  const isHostel = property.property_type === 'hostel'
  const originalPrice = Math.min(...property.rooms.map(room => 'price' in room ? room.price : room.price))
  const discount = Math.max(...property.rooms.map(room => 'discount' in room ? room.discount : room.discount))
  const lowestPrice = originalPrice - (originalPrice * discount) / 100
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  const rating = 4.5 // Example rating - replace with actual property.rating if available

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="w-full sm:w-2/5 relative flex pr-0">
          <div className="relative h-48 sm:h-52 md:h-60 lg:h-64 xl:h-72 sm:w-full flex-1">
            <img
              src={property.images[currentImageIndex].image}
              alt={property.name}
              className="object-contain w-full h-full p-2"
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
                    className="object-cover w-full h-full"
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
                  <Link href={`/property/${property.id}`}>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-1">{property.name}</h2>
                  </Link>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.location}
                  </p>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="text-lg font-medium">{rating}</span>
                  <span className="text-xs text-gray-500 ml-1">(120 reviews)</span>
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="flex flex-wrap gap-2 mb-2">
              {property.amenities.slice(0, 5).map((amenity, index) => {
                const Icon = amenityIcons[amenity.name] || Wifi;
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
                      {isHostel ? '/month' : '/night'}
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
                  <Link href={`/property/${property.id}`}>
                    <Button variant="outline" size="lg">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/property/${property.id}/book`}>
                    <Button
                      className="bg-[#B11E43] hover:bg-[#8f1836]"
                      size="lg"
                    >
                      Book Now
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

