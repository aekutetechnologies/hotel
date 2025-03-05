"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import { fetchOffers } from "@/lib/api/fetchOffers"
import { Offer } from "@/types/offer"


export function OffersSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    fetchOffers()
      .then(data => {
        setOffers(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Error fetching offers:", error)
        toast.error("Failed to load offers.")
        setIsLoading(false)
      })
  }, [])

  const nextSlide = () => {
    if (!offers.length) return
    setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length)
  }

  const prevSlide = () => {
    if (!offers.length) return
    setCurrentIndex((prevIndex) => (prevIndex - 1 + offers.length) % offers.length)
  }


  useEffect(() => {
    if (!offers.length) return
    const interval = setInterval(nextSlide, 5000) // Auto-advance every 5 seconds
    return () => clearInterval(interval)
  }, [nextSlide, offers.length])

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setCopiedCode(null), 2000) // Reset after 2 seconds
    } catch (err) {
      toast.error('Failed to copy code')
      console.error('Failed to copy code:', err)
    }
  }

  if (isLoading) {
    return <div>Loading offers...</div>
  }

  if (!offers.length) {
    return <div>No offers available.</div>
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">Exclusive Offers</h2>
          <p className="text-gray-600">Amazing deals and discounts on your next stay</p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-lg shadow-lg" style={{ height: "320px" }}>
            {offers.map((offer, index) => (
              <div
                key={offer.id}
                className={`absolute w-full h-full transition-opacity duration-500 ease-in-out ${
                  index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img
                  src={offer.images[0].image_url || "/placeholder.svg"}
                  alt={offer.title}
                  style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                  className="rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8">
                  <div className="text-white text-center max-w-lg">
                    <p className="mb-4 text-base">{offer.description}</p>
                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      className="bg-white text-black px-4 py-2 rounded-md inline-flex items-center gap-2 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold">Code: {offer.code}</span>
                      {copiedCode === offer.code ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex justify-center mt-4">
          {offers.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full mx-1 ${index === currentIndex ? "bg-red-600" : "bg-gray-300"}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
    )
  }
