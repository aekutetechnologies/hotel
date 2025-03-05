'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PropertyCard } from './PropertyCard'
import { Spinner } from "@/components/ui/spinner"
import { fetchProperties } from '@/lib/api/fetchProperties'
import { fetchAmenities } from '@/lib/api/fetchAmenities'
import { fetchCityArea } from '@/lib/api/fetchCityArea'
import { toast } from 'react-toastify'
import { Amenity, Property } from '@/types/property'

interface SearchResultsProps {
  properties: Property[]
}

export function SearchResults() {
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState([0, 50000])
  const [showMap, setShowMap] = useState(false)
  const [selectedSort, setSelectedSort] = useState("Popularity")
  const [propertyType, setPropertyType] = useState('all')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [roomAmenities, setRoomAmenities] = useState([])
  const [cityAreas, setCityAreas] = useState<string[]>([])
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [location, setLocation] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const bookingType = searchParams?.get('bookingType') || 'fulltime'

  useEffect(() => {
    const paramsObject = {
      propertyType: searchParams?.get('propertyType') || 'all',
      bookingType: bookingType,
      location: searchParams?.get('location') || '',
      checkInDate: searchParams?.get('checkInDate') || '',
      checkOutDate: searchParams?.get('checkOutDate') || '',
      checkInTime: searchParams?.get('checkInTime') || '',
      checkOutTime: searchParams?.get('checkOutTime') || '',
      months: searchParams?.get('months') || '',
      rooms: searchParams?.get('rooms') || '',
      guests: searchParams?.get('guests') || '',
    }

    const params = new URLSearchParams(paramsObject) // Convert to URLSearchParams
    setLocation(paramsObject.location || '')

    async function loadProperties() {
      try {
        setLoading(true)
        const fetchedProperties = await fetchProperties(params)
        console.log("fetchedProperties from search params", fetchedProperties)
        setProperties(fetchedProperties)

        const fetchedAmenities = await fetchAmenities()
        console.log("fetchedAmenities", fetchedAmenities)
        setRoomAmenities(fetchedAmenities.map((amenity: Amenity) => (
          {
            id: amenity.id,
            name: amenity.name
          }
        )))
        if (paramsObject.location) {
          try {
            const areas = await fetchCityArea(paramsObject.location)
            console.log("areas", areas.unique_areas)
            setCityAreas(areas.unique_areas)
          } catch (error) {
            console.error("Error fetching city areas:", error)
          }
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
        toast.error('Failed to load properties')
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [searchParams, selectedAreas, bookingType])

  const filteredLocations = useMemo(() => {
    return cityAreas.filter(loc =>
      loc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cityAreas, searchQuery]);

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const roomPrices = property.rooms.map(room =>
          bookingType === 'hourly' ? parseFloat(room.hourly_rate) : parseFloat(room.daily_rate)
      );
      const lowestPrice = Math.min(...roomPrices);
      const priceInRange = lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1]
      const typeMatches = propertyType === 'all' || property.property_type === propertyType
      const locationMatches = selectedLocations.length === 0 || selectedLocations.includes(property.location.split(',')[0].trim())
      const amenityMatches = selectedAmenities.length === 0 || selectedAmenities.every(selectedAmenity =>
        property.amenities.some(propertyAmenity => propertyAmenity.name === selectedAmenity)
      )
      const areaMatches = selectedAreas.length === 0 || selectedAreas.includes(property.area)
      const searchMatches = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchTerm.toLowerCase())

      return priceInRange && typeMatches && locationMatches && amenityMatches && searchMatches && areaMatches;
    });
  }, [priceRange, propertyType, selectedLocations, selectedAmenities, searchTerm, properties, selectedAreas, bookingType]);

  const handleLocationChange = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    )
  }

  const handleAreaChange = (area: string) => {
    setSelectedAreas(prevAreas => {
      if (prevAreas.includes(area)) {
        return prevAreas.filter(a => a !== area)
      } else {
        return [...prevAreas, area]
      }
    })
  }

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities(prevRoomAmenities =>
      prevRoomAmenities.includes(amenity)
        ? prevRoomAmenities.filter(a => a !== amenity)
        : [...prevRoomAmenities, amenity]
    )
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
      <style jsx global>{`
        .scrollbar-hidden {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
        }
      `}</style>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row h-screen">
          {/* Filters Sidebar */}
          <div className="md:w-1/4 md:max-w-xs flex-shrink-0 md:mr-6">
            <div className="bg-white rounded-lg shadow p-4 space-y-6 md:sticky md:top-4 overflow-y-auto max-h-[calc(100vh-2rem)]">
              <h2 className="text-lg font-semibold">Filters</h2>

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hidden">
                  {filteredLocations.map((location, index) => (
                    <label key={index} className="flex items-center">
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
                <div className="space-y-2 max-h-70 overflow-y-auto scrollbar-hidden">
                  {roomAmenities.map((amenity) => (
                    <label key={amenity.id} className="flex items-center">
                      <Checkbox
                        checked={selectedAmenities.includes(amenity.name)}
                        onCheckedChange={() => handleAmenityChange(amenity.name)}
                        className="mr-2"
                      />
                      <span className="text-sm">{amenity.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold">
                {filteredProperties.length} Properties in {location}, India
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
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
                </div>
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

            {selectedLocations.length > 0 && cityAreas.length > 0 && (
              <div className="flex flex-col mb-4">
                <Label className="mb-2">Areas in {selectedLocations[0]}</Label>
                <div className="flex flex-wrap gap-2">
                  {cityAreas.map(area => (
                    <Badge
                      key={area}
                      variant={selectedAreas.includes(area) ? "default" : "outline"}
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => handleAreaChange(area)}
                    >
                      <Checkbox
                        id={`area-${area}`}
                        checked={selectedAreas.includes(area)}
                        onCheckedChange={() => handleAreaChange(area)}
                        className="mr-1"
                      />
                      <Label htmlFor={`area-${area}`}>{area}</Label>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Property Listings */}
            <div className="space-y-2 mb-8">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  searchParams={searchParams}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
