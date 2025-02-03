'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PropertyCard } from './PropertyCard'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import { fetchProperties } from '@/lib/api/fetchProperties'
import { fetchAmenities } from '@/lib/api/fetchAmenities'
import { toast } from 'react-toastify'
import { Amenity } from '@/types/property'

const locations = [
  "Andheri East",
  "Andheri West",
  "Bandra",
  "Colaba",
  "Dadar",
  "Fort",
  "Juhu",
  "Powai",
  "Thane",
  "Worli"
]

const amenities = [
  "AC",
  "Free WiFi",
  "Swimming Pool",
  "Restaurant",
  "Gym",
  "Parking",
  "Room Service",
  "Bar",
  "Spa",
  "Business Center"
]

export function SearchResults() {
const [priceRange, setPriceRange] = useState([0, 50000])
const [showMap, setShowMap] = useState(false)
const [selectedSort, setSelectedSort] = useState("Popularity")
const [propertyType, setPropertyType] = useState('all')
const [selectedLocations, setSelectedLocations] = useState<string[]>([])
const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
const [searchTerm, setSearchTerm] = useState('')
const [currentPage, setCurrentPage] = useState(1)
const [properties, setProperties] = useState([])
const [loading, setLoading] = useState(true)
const [roomAmenities, setRoomAmenities] = useState([])
const itemsPerPage = 10

useEffect(() => {
  async function loadProperties() {
    try {
      const fetchedProperties = await fetchProperties()
      setProperties(fetchedProperties)

      const fetchedAmenities = await fetchAmenities()
      console.log("fetchedAmenities", fetchedAmenities)
      setRoomAmenities(fetchedAmenities.map((amenity: Amenity) => (
        {
          id: amenity.id,
          name: amenity.name
        }
      )))
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  loadProperties()
}, [])

const filteredProperties = useMemo(() => properties.filter(property => {
  const lowestPrice = Math.min(...property.rooms.map(room => 'price' in room ? room.price : room.price))
  const priceInRange = lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1]
  const typeMatches = propertyType === 'all' || property.property_type === propertyType
  const locationMatches = selectedLocations.length === 0 || selectedLocations.includes(property.location.split(',')[0].trim())
  const amenityMatches = selectedAmenities.length === 0 || selectedAmenities.every(amenity => property.amenities.includes(amenity))
  const searchMatches = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       property.location.toLowerCase().includes(searchTerm.toLowerCase())

  console.log(lowestPrice, priceInRange, typeMatches, locationMatches, amenityMatches, searchMatches)
  
  return priceInRange && typeMatches && locationMatches && amenityMatches && searchMatches
}), [priceRange, propertyType, selectedLocations, selectedAmenities, searchTerm, properties])

const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)

const paginatedProperties = filteredProperties.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
)

const handleLocationChange = (location: string) => {
  setSelectedLocations(prev => 
    prev.includes(location) 
      ? prev.filter(l => l !== location)
      : [...prev, location]
  )
}

const handleAmenityChange = (amenity: string) => {
  setSelectedAmenities(prev => 
    prev.includes(amenity)
      ? prev.filter(a => a !== amenity)
      : [...prev, amenity]
  )
}

const generatePageNumbers = () => {
  const pageNumbers = []
  const maxVisiblePages = 5

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i)
    }
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i)
      }
      pageNumbers.push('ellipsis')
      pageNumbers.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1)
      pageNumbers.push('ellipsis')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
      pageNumbers.push(totalPages)
    } else {
      pageNumbers.push(1)
      pageNumbers.push('ellipsis')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i)
      }
      pageNumbers.push('ellipsis')
      pageNumbers.push(totalPages)
    }
  }

  return pageNumbers
}

if (loading) {
  return (
    <div className="flex justify-center items-center h-screen">
      <Spinner className="w-10 h-10" />
    </div>
  )
}

return (
  <div className="min-h-screen bg-gray-50">
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full md:w-72 mb-6 md:mb-0">
          <div className="bg-white rounded-lg shadow p-4 space-y-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>

            {/* Property Type */}
            <div className="space-y-4">
              <h3 className="font-medium">Property Type</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="propertyType"
                    value="all"
                    checked={propertyType === 'all'}
                    onChange={() => setPropertyType('all')}
                    className="mr-2"
                  />
                  <span className="text-sm">All</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="propertyType"
                    value="hotel"
                    checked={propertyType === 'hotel'}
                    onChange={() => setPropertyType('hotel')}
                    className="mr-2"
                  />
                  <span className="text-sm">Hotels</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="propertyType"
                    value="hostel"
                    checked={propertyType === 'hostel'}
                    onChange={() => setPropertyType('hostel')}
                    className="mr-2"
                  />
                  <span className="text-sm">Hostels</span>
                </label>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-medium mb-4">Price Range</h3>
              <Slider
                min={0}
                max={50000}
                step={1000}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mb-2"
              />
              <div className="flex justify-between text-sm">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>

            {/* Locations */}
            <div>
              <h3 className="font-medium mb-4">Popular Locations</h3>
              <Input
                type="search"
                placeholder="Search locations..."
                className="mb-2"
              />
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {locations.map((location) => (
                  <label key={location} className="flex items-center">
                    <Checkbox
                      checked={selectedLocations.includes(location)}
                      onCheckedChange={() => handleLocationChange(location)}
                      className="mr-2"
                    />
                    <span className="text-sm">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="font-medium mb-4">Amenities</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {amenities.map((amenity) => (
                  <label key={amenity} className="flex items-center">
                    <Checkbox
                      checked={selectedAmenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityChange(amenity)}
                      className="mr-2"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">
              {filteredProperties.length} Properties in Mumbai, Maharashtra, India
            </h1>
            <div className="flex items-center gap-4">
              {/* <div className="flex items-center gap-2">
                <span className="text-sm">Map View</span>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer ${
                    showMap ? 'bg-[#B11E43]' : 'bg-gray-200'
                  }`}
                  onClick={() => setShowMap(!showMap)}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      showMap ? 'translate-x-6' : ''
                    }`}
                  />
                </div>
              </div> */}
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="border rounded-md px-3 py-1.5 text-sm"
              >
                <option>Popularity</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedLocations.length > 0 || selectedAmenities.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedLocations.map(location => (
                <Badge
                  key={location}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {location}
                  <button
                    onClick={() => handleLocationChange(location)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {selectedAmenities.map(amenity => (
                <Badge
                  key={amenity}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {amenity}
                  <button
                    onClick={() => handleAmenityChange(amenity)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Property Listings */}
          <div className="space-y-2">
            {paginatedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {generatePageNumbers().map((pageNumber, index) => (
                <PaginationItem key={index}>
                  {pageNumber === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNumber as number)}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  </div>
)}

