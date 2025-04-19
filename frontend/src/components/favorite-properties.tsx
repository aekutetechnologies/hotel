"use client"

import { useEffect, useState } from "react"
import { fetchFavouriteProperties } from "@/lib/api/fetchFavouriteProperties"
import { Heart } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"
import { PropertyCard } from "@/components/PropertyCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams, ReadonlyURLSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { format, addDays } from "date-fns"

// The structure from the API for favorite properties
interface FavoriteProperty {
  id: number
  property: any // Use any to avoid type conflicts with PropertyCard
  created_at: string
  updated_at: string
  is_active: boolean
  user: number
}

export function FavoriteProperties() {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const originalSearchParams = useSearchParams()

  // Generate today and tomorrow dates in YYYY-MM-DD format
  const today = new Date()
  const tomorrow = addDays(today, 1)
  const formattedToday = format(today, 'yyyy-MM-dd')
  const formattedTomorrow = format(tomorrow, 'yyyy-MM-dd')

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const data = await fetchFavouriteProperties()
        setFavorites(data as FavoriteProperty[])
      } catch (err) {
        setError("Failed to load favorite properties")
        toast.error("Failed to load favorite properties")
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [])

  // Function to create a custom searchParams object for each property
  const createCustomSearchParams = (property: any) => {
    const defaultLocation = property.location?.split(',')[0] || 'Mumbai'
    const propertyType = property.property_type === 'hostel' ? 'hostel' : 'hotel'
    const bookingType = propertyType === 'hostel' ? 'monthly' : 'daily'
    
    // Create a query parameters object for property links
    const paramObj = {
      location: defaultLocation,
      propertyType: propertyType,
      bookingType: bookingType,
      checkInDate: formattedToday,
      checkOutDate: formattedTomorrow,
      rooms: '1',
      guests: '1'
    }
    
    // Use Object.entries to create a compatible params object that can be treated as ReadonlyURLSearchParams
    return {
      get: (key: string) => paramObj[key as keyof typeof paramObj] || null,
      getAll: (key: string) => [paramObj[key as keyof typeof paramObj] || ''],
      has: (key: string) => key in paramObj,
      entries: () => Object.entries(paramObj)[Symbol.iterator](),
      keys: () => Object.keys(paramObj)[Symbol.iterator](),
      values: () => Object.values(paramObj)[Symbol.iterator](),
      forEach: (fn: any) => Object.entries(paramObj).forEach(([key, value]) => fn(value, key)),
      toString: () => new URLSearchParams(paramObj).toString()
    } as any as ReadonlyURLSearchParams;
  }

  if (isLoading) {
    return (
      <div className="w-full py-8 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B11E43]"></div>
          <p className="mt-4 text-gray-600">Loading your favorite properties...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-2xl my-8">
        <CardHeader>
          <CardTitle className="text-xl text-red-600">Error Loading Favorites</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#B11E43] hover:bg-[#8f1836] text-white"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (favorites.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl my-8">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-gray-400" />
          </div>
          <CardTitle className="text-xl">No Favorite Properties Yet</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-500 mb-6">Start exploring properties and add them to your favorites!</p>
          <Link href="/home?section=hotels">
            <Button className="bg-[#B11E43] hover:bg-[#8f1836] text-white">
              Explore Properties
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">My Favorite Properties</CardTitle>
          <div className="flex items-center">
            <Heart className="h-5 w-5 text-[#B11E43] fill-[#B11E43] mr-2" />
            <span className="text-sm text-gray-500">
              {favorites.length} {favorites.length === 1 ? 'property' : 'properties'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Here are all the properties you've saved as favorites.</p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {favorites.map((favorite) => {
          // Create a custom searchParams for this property
          const customParams = createCustomSearchParams(favorite.property);
          
          return (
            <Card key={favorite.id} className="overflow-hidden">
              <CardContent className="p-0">
                <PropertyCard 
                  property={favorite.property} 
                  searchParams={customParams}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  )
} 