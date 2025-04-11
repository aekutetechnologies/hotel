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
import { Button } from "@/components/ui/button"

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
  const [selectedSort, setSelectedSort] = useState("Price: Low to High")
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
  const [isFilterLoading, setIsFilterLoading] = useState(false)
  // Add state for mobile filter visibility (default hidden on mobile)
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false)
  const bookingType = searchParams?.get('bookingType') || 'daily'
  
  // Add this to handle window width detection for responsive layout
  const [isDesktop, setIsDesktop] = useState(false)
  
  // Check if we're on desktop when component mounts and on window resize
  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    // Check initially
    checkIfDesktop()
    
    // Add resize listener
    window.addEventListener('resize', checkIfDesktop)
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkIfDesktop)
  }, [])

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const paramsObject = {
      propertyType: searchParams?.get('propertyType') || '', // Default to 'all' since we removed the filter
      bookingType: bookingType,
      location: searchParams?.get('location') || '',
      checkInDate: searchParams?.get('checkInDate') || '',
      checkOutDate: searchParams?.get('checkOutDate') || '',
      checkInTime: searchParams?.get('checkInTime') || '',
      checkOutTime: searchParams?.get('checkOutTime') || '',
      months: searchParams?.get('months') || '',
      rooms: searchParams?.get('rooms') || '',
      guests: searchParams?.get('guests') || '',
      id: id || '',
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
            console.log("areas", (areas as any).unique_areas)
            if (areas && (areas as any).unique_areas) {
              setCityAreas((areas as any).unique_areas)
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
  }, [searchParams, bookingType]) // Remove selectedAreas from this dependency array

  // Add a new useEffect to handle filter changes
  useEffect(() => {
    console.log("Filter changes detected, applying filters...");
    
    // We only want to trigger isFilterLoading, not a full reload
    // This provides visual feedback while the client-side filtering happens
    if (!loading) {
      setIsFilterLoading(true);
      
      // Set a timeout to simulate processing time and ensure a smooth UI experience
      setTimeout(() => {
        setIsFilterLoading(false);
      }, 500);
    }
  }, [selectedLocations, selectedAreas, selectedAmenities, priceRange, searchTerm]);

  const filteredLocations = useMemo(() => {
    return cityAreas.filter(loc =>
      loc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cityAreas, searchQuery]);

  const filteredProperties = useMemo(() => {
    let filtered = properties.filter(property => {
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
      
      // Fix the location filtering logic
      const locationMatches = selectedLocations.length === 0 || 
        (property.city && property.city.name && selectedLocations.includes(property.city.name)) ||
        (property.location && selectedLocations.some(loc => property.location.includes(loc)));
      
      // Fix the amenities filtering logic  
      const amenityMatches = selectedAmenities.length === 0 || 
        (property.amenities && Array.isArray(property.amenities) && 
          selectedAmenities.every(selectedAmenity => {
            return property.amenities.some(propertyAmenity => {
              if (!propertyAmenity) return false;
              return propertyAmenity.name === selectedAmenity || 
                    (typeof propertyAmenity === 'string' && propertyAmenity === selectedAmenity);
            });
          })
        );
      
      // Filter by area
      const areaMatches = selectedAreas.length === 0 || 
        (property.area && selectedAreas.includes(property.area));
      
      // Filter by search term
      const searchMatches = !searchTerm || 
        (property.name && property.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (property.location && property.location.toLowerCase().includes(searchTerm.toLowerCase()));

      return priceInRange && locationMatches && amenityMatches && searchMatches && areaMatches;
    });

    // Sort properties based on selectedSort
    if (selectedSort === "Price: Low to High") {
      return filtered.sort((a, b) => {
        // Calculate lowest price for both properties
        const getLowestPrice = (property: Property) => {
          if (!property.rooms || property.rooms.length === 0) return 0;
          
          const prices = property.rooms.map(room => {
            if (property.property_type === 'hostel' && room.monthly_rate && parseFloat(room.monthly_rate) > 0) {
              return parseFloat(room.monthly_rate);
            } else {
              return bookingType === 'hourly' 
                ? parseFloat(room.hourly_rate?.toString() || '0') 
                : parseFloat(room.daily_rate?.toString() || '0');
            }
          });
          return prices.length > 0 ? Math.min(...prices) : 0;
        };
        
        return getLowestPrice(a) - getLowestPrice(b);
      });
    } else if (selectedSort === "Price: High to Low") {
      return filtered.sort((a, b) => {
        // Calculate lowest price for both properties
        const getLowestPrice = (property: Property) => {
          if (!property.rooms || property.rooms.length === 0) return 0;
          
          const prices = property.rooms.map(room => {
            if (property.property_type === 'hostel' && room.monthly_rate && parseFloat(room.monthly_rate) > 0) {
              return parseFloat(room.monthly_rate);
            } else {
              return bookingType === 'hourly' 
                ? parseFloat(room.hourly_rate?.toString() || '0') 
                : parseFloat(room.daily_rate?.toString() || '0');
            }
          });
          return prices.length > 0 ? Math.min(...prices) : 0;
        };
        
        return getLowestPrice(b) - getLowestPrice(a);
      });
    } else if (selectedSort === "Rating: High to Low") {
      return filtered.sort((a, b) => {
        const getRating = (property: Property) => {
          if (property.reviews && Array.isArray(property.reviews) && property.reviews.length > 0) {
            return property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length;
          }
          return 0;
        };
        
        return getRating(b) - getRating(a);
      });
    } else if (selectedSort === "Rating: Low to High") {
      return filtered.sort((a, b) => {
        const getRating = (property: Property) => {
          if (property.reviews && Array.isArray(property.reviews) && property.reviews.length > 0) {
            return property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length;
          }
          return 0;
        };
        
        return getRating(a) - getRating(b);
      });
    }

    return filtered;
  }, [priceRange, selectedLocations, selectedAmenities, searchTerm, properties, selectedAreas, bookingType, selectedSort]);

  const handleLocationChange = (location: string) => {
    console.log("Location selected:", location);
    setIsFilterLoading(true);
    
    const newLocations = selectedLocations.includes(location)
      ? selectedLocations.filter(l => l !== location)
      : [...selectedLocations, location];
    
    console.log("Updated locations:", newLocations);
    setSelectedLocations(newLocations);
  }

  const handleAreaChange = (area: string) => {
    console.log("Area selected:", area);
    setIsFilterLoading(true);
    
    const newAreas = selectedAreas.includes(area)
      ? selectedAreas.filter(a => a !== area)
      : [...selectedAreas, area];
    
    console.log("Updated areas:", newAreas);
    setSelectedAreas(newAreas);
  }

  const handleAmenityChange = (amenity: string) => {
    console.log("Amenity selected:", amenity);
    setIsFilterLoading(true);
    
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    
    console.log("Updated amenities:", newAmenities);
    setSelectedAmenities(newAmenities);
  }

  // Add a debug effect to log whenever filter states change
  useEffect(() => {
    console.log("Filter state changed:");
    console.log("- Selected locations:", selectedLocations);
    console.log("- Selected areas:", selectedAreas);
    console.log("- Selected amenities:", selectedAmenities);
    
    // Log first few properties with their location and amenities data
    if (properties.length > 0) {
      console.log("Sample property data:");
      properties.slice(0, 2).forEach((property, index) => {
        console.log(`Property ${index + 1}:`, {
          id: property.id,
          name: property.name,
          city: property.city,
          location: property.location,
          area: property.area,
          amenities: property.amenities
        });
      });
    }
  }, [selectedLocations, selectedAreas, selectedAmenities, properties]);

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
        
        /* Range slider styles moved from nested location */
        .range-slider [data-orientation="horizontal"] {
          height: 20px;
        }
        .range-slider [role="slider"] {
          width: 20px;
          height: 20px;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 2px solid #B11E43;
        }

        /* Mobile filter overlay styles */
        @media (max-width: 768px) {
          .filter-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 40;
          }
          
          .filter-panel {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            max-height: 85vh;
            z-index: 50;
            border-top-left-radius: 1rem;
            border-top-right-radius: 1rem;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
          }
          
          .filter-drawer-handle {
            width: 50px;
            height: 4px;
            background-color: #ccc;
            border-radius: 2px;
            margin: 10px auto;
          }
        }
      `}</style>
      <div className="container mx-auto px-4 py-6">
        {/* Mobile Filter Toggle Button */}
        <div className="md:hidden mb-4 sticky top-0 z-10 bg-gray-50 pb-2">
          <Button 
            variant="neutral" 
            className="w-full flex items-center justify-center gap-2 bg-white shadow-sm border-gray-200"
            onClick={() => setShowFiltersOnMobile(!showFiltersOnMobile)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            Filters {(selectedLocations.length > 0 || selectedAmenities.length > 0) && 
              <Badge variant="secondary" className="ml-1 text-xs bg-gray-100">
                {selectedLocations.length + selectedAmenities.length}
              </Badge>
            }
          </Button>
        </div>

        <div className="flex flex-col md:flex-row h-screen">
          {/* Mobile Filter Overlay */}
          <AnimatePresence>
            {showFiltersOnMobile && (
              <motion.div 
                className="filter-overlay md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFiltersOnMobile(false)}
              />
            )}
          </AnimatePresence>
          
          {/* Filters Sidebar - Desktop always visible, Mobile conditionally visible */}
          <AnimatePresence>
            {(showFiltersOnMobile || isDesktop) && (
              <motion.div 
                className="md:w-1/4 md:max-w-xs flex-shrink-0 md:mr-6 md:block filter-panel md:static md:bg-transparent md:shadow-none md:z-auto"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Drag Handle for Mobile */}
                <div className="filter-drawer-handle md:hidden" />
                
                <motion.div 
                  className="bg-white rounded-lg shadow p-4 space-y-6 md:sticky md:top-4 overflow-y-auto max-h-[calc(100vh-2rem)]"
                  whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center">
                    <motion.h2 
                      className="text-lg font-semibold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Filters
                    </motion.h2>
                    
                    {/* Close Button - Only on Mobile */}
                    <button 
                      className="md:hidden text-gray-400 hover:text-gray-600"
                      onClick={() => setShowFiltersOnMobile(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  {/* Price Range */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="font-medium mb-4">Price Range</h3>
                    <div className="range-slider">
                    <Slider
                      min={0}
                        max={20000}
                      step={1000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-2"
                    />
                    </div>
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
                  
                  {/* Apply Filters Button - Only on Mobile */}
                  <motion.div className="md:hidden">
                    <Button 
                      className="w-full bg-[#B11E43] hover:bg-[#8f1836] text-white mt-4"
                      onClick={() => setShowFiltersOnMobile(false)}
                    >
                      Apply Filters
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className={`flex-1 overflow-y-auto scrollbar-hidden ${showFiltersOnMobile && !isDesktop ? 'opacity-30 pointer-events-none' : ''}`}>
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
                <motion.select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="border rounded-md px-3 py-1.5 text-sm border-gray-200 focus:border-[#B11E43] outline-none"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating: High to Low</option>
                  <option>Rating: Low to High</option>
                </motion.select>
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
                  <svg
  xmlns="http://www.w3.org/2000/svg"
  className="h-5 w-5 transform -translate-y-2" 
  fill="none"
  viewBox="0 0 30 30"
  stroke="currentColor"
>
  <path 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    strokeWidth={2} 
    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
  />
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

            {/* Property Listings */}
            <div className="space-y-6 mb-8">
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
