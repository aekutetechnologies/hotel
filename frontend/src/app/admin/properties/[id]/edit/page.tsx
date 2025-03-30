'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PropertyForm } from "@/components/admin/PropertyForm"
import { fetchProperty } from '@/lib/api/fetchProperty'
import { toast } from 'react-toastify'
import { LoadingIndicator } from '@/components/ui/LoadingIndicator'

export default function EditProperty() {
  const params = useParams()
  const propertyId = Number(params.id)
  const [propertyData, setPropertyData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProperty() {
      try {
        const data = await fetchProperty(propertyId.toString())
        setPropertyData(data)
      } catch (error) {
        console.error('Error fetching property:', error)
        toast.error('Failed to load property')
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [propertyId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIndicator 
          variant="skeleton" 
          text="Loading property information..." 
        />
      </div>
    )
  }

  if (!propertyData) {
    return <div>Property not found</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Edit Property</h1>
      <PropertyForm initialData={propertyData} isEditing />
    </div>
  )
}

