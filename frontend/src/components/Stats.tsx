'use client'

import { useState, useEffect } from 'react'
import { fetchProperties } from '@/lib/api/fetchProperties'
import { toast } from 'react-toastify'

interface Property {
  id: number
  property_type: string
  city: {
    name: string
  }
}

export function Statistics() {
  const [premiumPropertiesCount, setPremiumPropertiesCount] = useState(0)
  const [propertyTypesCount, setPropertyTypesCount] = useState(0)
  const [citiesCount, setCitiesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        const properties = await fetchProperties()
        if (properties) {
          setPremiumPropertiesCount(properties.length)
          setPropertyTypesCount([...new Set(properties.map((property: Property) => property.property_type))].length)
          setCitiesCount([...new Set(properties.map((property: Property) => property.city.name))].length)
        }
      } catch (error) {
        console.error('Error fetching properties for stats:', error)
        toast.error('Failed to load property statistics.')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="bg-gradient-to-b from-white to-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-red-600 mb-2">{premiumPropertiesCount}</div>
            <div className="text-gray-600">Premium Properties</div>
          </div>
          <div className="text-center p-8 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-red-600 mb-2">{propertyTypesCount}</div>
            <div className="text-gray-600">Property Type</div>
          </div>
          <div className="text-center p-8 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-red-600 mb-2">{citiesCount}</div>
            <div className="text-gray-600">Cities</div>
          </div>
        </div>
      </div>
    </div>
  )
}

