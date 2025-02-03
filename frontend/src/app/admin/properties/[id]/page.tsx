'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { PropertyDetails } from "@/components/PropertyDetails"
import { properties } from "@/lib/dummy-data"
import { ArrowLeft, Edit } from 'lucide-react'
import { Property } from '@/types/property'

export default function ViewProperty() {
  const params = useParams()
  const router = useRouter()
  const propertyId = Number(params.id)
  const propertyData = properties.find(p => p.id === propertyId) as Property | undefined

  if (!propertyData) {
    return <div>Property not found</div>
  }

  const handleBooking = () => {
    router.push(`/admin/bookings/new?propertyId=${propertyId}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Property Details</h1>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={() => router.push(`/admin/properties/${propertyId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Property
          </Button>
          <Button onClick={handleBooking} className="bg-[#B11E43] hover:bg-[#8f1836]">
            Book Now
          </Button>
        </div>
      </div>
      <PropertyDetails property={propertyData} />
    </div>
  )
}

