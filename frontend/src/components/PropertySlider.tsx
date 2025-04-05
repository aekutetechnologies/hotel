"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchProperties } from '@/lib/api/fetchProperties'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from 'next/navigation'

interface Property {
  id: number
  name: string
  location: string
  images: { image: string }[]
  property_type: string
}

export function PropertiesSlider() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasFetched, setHasFetched] = useState(false)

  // Use useCallback to ensure the function reference doesn't change on re-renders
  const loadProperties = useCallback(async () => {
    // Skip if we've already fetched the properties
    if (hasFetched) return
    
    setIsLoading(true)
    try {
      console.log("Fetching properties in PropertySlider")
      const data = await fetchProperties()
      const transformedData = data.map((property: any) => ({
        id: property.id,
        name: property.name,
        location: property.location,
        property_type: property.property_type,
        images: property.images.map((img: any) => ({
          image: typeof img === 'string' ? img : (img.image_url || img.image || '')
        }))
      }))
      setProperties(transformedData)
      setHasFetched(true)
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setIsLoading(false)
    }
  }, [hasFetched])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  useEffect(() => {
    if (!properties.length) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % properties.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [properties.length])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % properties.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + properties.length) % properties.length)
  }

  const handlePropertyClick = (propertyId: number) => {
    router.push(`/property/${propertyId}`)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (!properties.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-center text-gray-500">No properties available.</p>
      </div>
    )
  }

  // Create an array with duplicated items for endless scroll effect
  const displayProperties = [...properties, ...properties, ...properties]
  const offset = properties.length
  const adjustedIndex = currentIndex + offset

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Our Properties</h2>
      <div className="relative">
        <div className="flex overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${(adjustedIndex * 100) / 3}%)`,
              width: `${displayProperties.length * 100 / 3}%`
            }}
          >
            {displayProperties.map((property, index) => (
              <Card
                key={`${property.id}-${index}`}
                className="flex-shrink-0 w-1/3 px-2 cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => handlePropertyClick(property.id)}
              >
                <div className="relative h-[320px] p-2">
                  <div className="absolute inset-x-2 top-2 h-14 bg-gradient-to-b from-black to-transparent"></div>
                  <img
                    src={property.images[0]?.image || "/placeholder.svg"}
                    alt={property.name}
                    style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                    className="rounded-md"
                  />
                  <div className="absolute inset-x-2 bottom-2 h-20 bg-gradient-to-t from-black to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white text-gray-800">
                      {property.property_type}
                    </Badge>
                  </div>
                  <div className="absolute inset-x-2 bottom-2 p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{property.name}</h3>
                    <p className="text-sm text-gray-200">{property.location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
        >
          <ChevronLeft className="h-6 w-6 text-gray-600" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
        >
          <ChevronRight className="h-6 w-6 text-gray-600" />
        </button>
      </div>
    </div>
  )
}
