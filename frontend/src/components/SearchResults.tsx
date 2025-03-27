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
import { searchProperties } from '@/lib/api/searchProperties'
import { fetchAmenities } from '@/lib/api/fetchAmenities'
import { fetchCityArea } from '@/lib/api/fetchCityArea'
import { toast } from 'react-toastify'
import { Amenity, Property } from '@/types/property'
import { ErrorPage } from '@/components/ErrorPage'
import { motion, AnimatePresence } from 'framer-motion'

// Define interface for room amenities if not defined in types
interface RoomAmenity {
  id: string;
  name: string;
}

// Add this FilterLoader component after the other interfaces but before the SearchResults component
const FilterLoader = () => (
  <motion.div 
    className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Spinner className="w-10 h-10 mb-4 text-[#B11E43]" />
    <p className="text-gray-700 font-medium">Updating your results...</p>
    <p className="text-sm text-gray-500 mt-1">Finding the perfect properties for you</p>
  </motion.div>
);

export function SearchResults() {
  console.log("SearchResults component rendering")
  const searchParams = useSearchParams()

  // Log search parameters for debugging
  useEffect(() => {
    console.log("Search Parameters:", {
      location: searchParams?.get('location'),
      propertyType: searchParams?.get('propertyType'),
      bookingType: searchParams?.get('bookingType'),
      checkInDate: searchParams?.get('checkInDate'),
      checkOutDate: searchParams?.get('checkOutDate'),
      checkInTime: searchParams?.get('checkInTime'),
      checkOutTime: searchParams?.get('checkOutTime'),
      rooms: searchParams?.get('rooms'),
      guests: searchParams?.get('guests'),
    })
  }, [searchParams])

  const [priceRange, setPriceRange] = useState([0, 50000])
  const [showMap, setShowMap] = useState(false)
  const [selectedSort, setSelectedSort] = useState("Popularity")
  const [propertyType, setPropertyType] = useState('all')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [roomAmenities, setRoomAmenities] = useState<RoomAmenity[]>([])
  const [cityAreas, setCityAreas] = useState<string[]>([])
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [location, setLocation] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const bookingType = searchParams?.get('bookingType') || 'daily'

  // Add this new state to track filter changes specifically
  const [isFilterLoading, setIsFilterLoading] = useState(false);

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
      setHasError(false)
      // Set both loading states when fetching starts
      setLoading(true)
      setIsFilterLoading(true)
      try {
        console.log("Fetching properties with params:", paramsObject)
        
        // Use searchProperties instead of fetchProperties
        const fetchedProperties = await searchProperties(params)
        console.log("fetchedProperties from search params", fetchedProperties)
        setProperties(fetchedProperties)

        try {
          const fetchedAmenities = await fetchAmenities()
          console.log("fetchedAmenities", fetchedAmenities)
          if (Array.isArray(fetchedAmenities)) {
            setRoomAmenities(fetchedAmenities.map((amenity: any) => ({
              id: amenity.id?.toString() || '',
              name: amenity.name || ''
            })))
          }
        } catch (amenityError) {
          console.error("Error fetching amenities:", amenityError)
          // Don't fail the entire component if just the amenities can't be fetched
        }
        
        if (paramsObject.location) {
          try {
            console.log("Fetching city areas for:", paramsObject.location)
            const areas = await fetchCityArea(paramsObject.location)
            console.log("areas", areas.unique_areas)
            if (areas && areas.unique_areas) {
              setCityAreas(areas.unique_areas)
            }
          } catch (error) {
            console.error("Error fetching city areas:", error)
            // Don't fail the entire component if just the areas can't be fetched
          }
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
        setHasError(true)
        setErrorMessage('Failed to load properties. Please try again later.')
        toast.error('Failed to load properties')
      } finally {
        // Always end loading state
        setLoading(false)
        // Set a slight delay for filter loading to ensure smooth transition
        setTimeout(() => {
          setIsFilterLoading(false)
        }, 500)
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
      // Safety check for property structure
      if (!property || !property.rooms || !Array.isArray(property.rooms)) {
        return false;
      }

      // Filter by price
      const roomPrices = property.rooms.map(room => {
        // For hostels, use monthly rates when available
        if (property.property_type === 'hostel' && room.monthly_rate && parseFloat(room.monthly_rate) > 0) {
          return parseFloat(room.monthly_rate);
        } else {
          return bookingType === 'hourly' 
            ? parseFloat(room.hourly_rate?.toString() || '0') 
            : parseFloat(room.daily_rate?.toString() || '0');
        }
      });
      
      const lowestPrice = roomPrices.length > 0 
        ? Math.min(...roomPrices) 
        : 0;
      
      const priceInRange = lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];
      
      // Filter by property type
      const typeMatches = propertyType === 'all' || property.property_type === propertyType;
      
      // Filter by location
      const locationMatches = selectedLocations.length === 0 || 
        (property.location && selectedLocations.includes(property.location.split(',')[0].trim()));
      
      // Filter by amenities
      const amenityMatches = selectedAmenities.length === 0 || 
        (property.amenities && Array.isArray(property.amenities) && 
          selectedAmenities.every(selectedAmenity =>
            property.amenities.some((propertyAmenity: any) => 
              propertyAmenity && propertyAmenity.name === selectedAmenity
            )
          )
        );
      
      // Filter by area
      const areaMatches = selectedAreas.length === 0 || 
        (property.area && selectedAreas.includes(property.area));
      
      // Filter by search term
      const searchMatches = !searchTerm || 
        (property.name && property.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (property.location && property.location.toLowerCase().includes(searchTerm.toLowerCase()));

      return priceInRange && typeMatches && locationMatches && amenityMatches && searchMatches && areaMatches;
    });
  }, [priceRange, propertyType, selectedLocations, selectedAmenities, searchTerm, properties, selectedAreas, bookingType]);

  const handleLocationChange = (location: string) => {
    setIsFilterLoading(true)
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    )
  }

  const handleAreaChange = (area: string) => {
    setIsFilterLoading(true)
    setSelectedAreas(prevAreas => {
      if (prevAreas.includes(area)) {
        return prevAreas.filter(a => a !== area)
      } else {
        return [...prevAreas, area]
      }
    })
  }

  const handleAmenityChange = (amenity: string) => {
    setIsFilterLoading(true)
    setSelectedAmenities(prevRoomAmenities =>
      prevRoomAmenities.includes(amenity)
        ? prevRoomAmenities.filter(a => a !== amenity)
        : [...prevRoomAmenities, amenity]
    )
  }

  if (hasError) {
    return <ErrorPage message={errorMessage} onRetry={() => window.location.reload()} />
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
          <motion.div 
            className="md:w-1/4 md:max-w-xs flex-shrink-0 md:mr-6"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div 
              className="bg-white rounded-lg shadow p-4 space-y-6 md:sticky md:top-4 overflow-y-auto max-h-[calc(100vh-2rem)]"
              whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              transition={{ duration: 0.2 }}
            >
              <motion.h2 
                className="text-lg font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Filters
              </motion.h2>

              {/* Property Type */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-medium">Property Type</h3>
                <div className="space-y-2">
                  <motion.label 
                    className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-50"
                    whileHover={{ backgroundColor: "rgb(249 250 251)", x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      value="all"
                      checked={propertyType === 'all'}
                      onChange={() => setPropertyType('all')}
                      className="mr-2"
                    />
                    <span className="text-sm">All</span>
                  </motion.label>
                  <motion.label 
                    className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-50"
                    whileHover={{ backgroundColor: "rgb(249 250 251)", x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      value="hotel"
                      checked={propertyType === 'hotel'}
                      onChange={() => setPropertyType('hotel')}
                      className="mr-2"
                    />
                    <span className="text-sm">Hotels</span>
                  </motion.label>
                  <motion.label 
                    className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-50"
                    whileHover={{ backgroundColor: "rgb(249 250 251)", x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      value="hostel"
                      checked={propertyType === 'hostel'}
                      onChange={() => setPropertyType('hostel')}
                      className="mr-2"
                    />
                    <span className="text-sm">Hostels</span>
                  </motion.label>
                </div>
              </motion.div>

              {/* Price Range */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
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
              </motion.div>

              {/* Locations */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="font-medium mb-4">Popular Locations</h3>
                <Input
                  type="search"
                  placeholder="Search locations..."
                  className="mb-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hidden">
                  {filteredLocations.map((location, locationIndex) => (
                    <motion.label 
                      key={locationIndex} 
                      className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                      whileHover={{ backgroundColor: "rgb(249 250 251)", x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Checkbox
                        checked={selectedLocations.includes(location)}
                        onCheckedChange={() => handleLocationChange(location)}
                        className="mr-2"
                      />
                      <span className="text-sm">{location}</span>
                    </motion.label>
                  ))}
                </div>
              </motion.div>

              {/* Amenities */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="font-medium mb-4">Amenities</h3>
                <div className="space-y-2 max-h-70 overflow-y-auto scrollbar-hidden">
                  {roomAmenities.map((amenity) => (
                    <motion.label 
                      key={amenity.id} 
                      className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                      whileHover={{ backgroundColor: "rgb(249 250 251)", x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Checkbox
                        checked={selectedAmenities.includes(amenity.name)}
                        onCheckedChange={() => handleAmenityChange(amenity.name)}
                        className="mr-2"
                      />
                      <span className="text-sm">{amenity.name}</span>
                    </motion.label>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold">
                {filteredProperties.length} Properties in {location || 'All Locations'}, India
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
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating: High to Low</option>
                  <option>Rating: Low to High</option>
                </select>
              </div>
            </div>

            {/* Search Bar */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search by property name, location or keyword..."
                  className="pl-10 py-2 border-2 focus:border-[#B11E43] transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <motion.div 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            {/* Active Filters */}
            <AnimatePresence>
              {(selectedLocations.length > 0 || selectedAmenities.length > 0) && (
                <motion.div 
                  className="flex flex-wrap gap-2 mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {selectedLocations.map(location => (
                    <motion.div
                      key={location}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge
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
                    </motion.div>
                  ))}
                  {selectedAmenities.map(amenity => (
                    <motion.div
                      key={amenity}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge
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
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {selectedLocations.length > 0 && cityAreas.length > 0 && (
              <motion.div 
                className="flex flex-col mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Label className="mb-2">Areas in {selectedLocations[0]}</Label>
                <div className="flex flex-wrap gap-2">
                  {cityAreas.map(area => (
                    <motion.div
                      key={area}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge
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
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Property Listings */}
            <div className="space-y-2 mb-8">
              <AnimatePresence mode="wait">
                {isFilterLoading ? (
                  <FilterLoader key="loader" />
                ) : filteredProperties.length > 0 ? (
                  <motion.div
                    key="property-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {filteredProperties.map((property, index) => (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.1,
                          ease: "easeOut"
                        }}
                        whileHover={{ 
                          y: -5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <PropertyCard
                          property={property}
                          searchParams={searchParams}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="no-results"
                    className="bg-white rounded-lg shadow p-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-lg text-gray-600 mb-4">No properties found matching your criteria.</p>
                    <p className="text-gray-500">Try adjusting your filters or search for a different location.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
