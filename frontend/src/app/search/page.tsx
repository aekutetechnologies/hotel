'use client'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SearchResults } from '@/components/SearchResults'
import { fetchProperties } from '@/lib/api/fetchProperties'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const location = searchParams.get('location') || ''
  const propertyType = searchParams.get('propertyType') || ''
  const bookingType = searchParams.get('bookingType') || 'fulltime'
  const checkInDate = searchParams.get('checkInDate') || ''
  const checkOutDate = searchParams.get('checkOutDate') || ''
  const checkInTime = searchParams.get('checkInTime') || ''
  const checkOutTime = searchParams.get('checkOutTime') || ''
  const rooms = searchParams.get('rooms') || ''
  const guests = searchParams.get('guests') || ''

  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetchProperties({ location, propertyType, bookingType, checkInDate, checkOutDate, checkInTime, checkOutTime, rooms, guests })
      .then(data => {
        setProperties(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Error fetching properties:", error)
        setIsLoading(false)
      })
  }, [location, propertyType, bookingType, checkInDate, checkOutDate, checkInTime, checkOutTime, rooms, guests])

  return (
    <>
      <Header />
      <main className="pt-20">
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Search Results</h1>
          {isLoading ? (
            <div className="flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : properties.length > 0 ? (
            <SearchResults properties={properties} />
          ) : (
            <p>No properties found for the selected criteria.</p>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

