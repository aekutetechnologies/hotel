"use client"

import { useEffect, useState } from "react"
import { fetchFavouriteProperties } from "@/lib/api/fetchFavouriteProperties"
import { Heart } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"
import { PropertyCard } from "@/components/PropertyCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

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
  const searchParams = useSearchParams()

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const data = await fetchFavouriteProperties()
        setFavorites(data)
      } catch (err) {
        setError("Failed to load favorite properties")
        toast.error("Failed to load favorite properties")
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [])

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
          <Link href="/">
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
        {favorites.map((favorite) => (
          <Card key={favorite.id} className="overflow-hidden">
            <CardContent className="p-0">
              <PropertyCard 
                property={favorite.property} 
                searchParams={searchParams} 
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 